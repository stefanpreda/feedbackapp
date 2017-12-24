package worker;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;

import org.json.JSONObject;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisConnectionException;


//Build this with mvn verify
//Start this with java -jar target/worker-jar-with-dependencies.jar
public class Worker {

	public static void main(String[] args) {
		
		System.out.println("Worker started");
		
		try {
			//Defined in the dockerfile
			//Hostname for redis queue is "redis"
			Jedis redis = connectToRedis("redis");
			System.out.println("Connected to redis");
			
			//Defined in the dockerfile
			//Hostname for postgresql database is "db"
			Connection dbConn = connectToDB("db");			
			System.out.println("Connected to postgresql");
			
			while (true) {
				//get first element from redis which is a pair of REDIS_ID - JSON (as string)
				//feedbacks are inserted using the redis key (queueKey) "feedbacks"
				String feedbackJSON = redis.blpop(0, "feedbacks").get(1);
				JSONObject feedbackData = new JSONObject(feedbackJSON);

				System.out.println("Got entry from Redis");
				
				ArrayList<String> parameters = new ArrayList<>();
				parameters.add(feedbackData.getString("name"));
				parameters.add(String.valueOf(feedbackData.getInt("age")));
				parameters.add(feedbackData.getString("service_name"));
				parameters.add(feedbackData.getString("timeliness"));
				parameters.add(feedbackData.getString("quality"));
				parameters.add(feedbackData.getString("overall_satisfaction"));
				parameters.add(feedbackData.getString("use_service_again"));
				
				updateFeedback(dbConn, parameters);

				System.out.println("Wrote entry in database");
			}
			
		} catch (SQLException e) {
			System.out.println(e.getLocalizedMessage());
			System.exit(1);
		}
	}

	private static void updateFeedback(Connection dbConn, ArrayList<String> parameters) throws SQLException {
		
		PreparedStatement insertStatement = dbConn.prepareStatement(
				"INSERT INTO feedbacks (name, age, service_name, timeliness, quality, overall_satisfaction, use_service_again) VALUES (?, ?, ?, ?, ?, ?, ?)");
		
		for (int i = 0; i < parameters.size(); i++)
			if (i == 1)
				insertStatement.setInt(i + 1, Integer.parseInt(parameters.get(i)));
			else
				insertStatement.setString(i + 1, parameters.get(i));
		
		System.out.println(insertStatement.toString());

		try {
			insertStatement.executeUpdate();
		} catch (SQLException e) {
			System.out.println(e.getLocalizedMessage());
		}

		
	}

	//java connection url: jdbc:postgresql://db/postgres
	// type=postgresql, host=db, database=postgres, user=postgres, password="" (these are defaults)
	private static Connection connectToDB(String host) throws SQLException {
		Connection conn = null;
		
		try {
			Class.forName("org.postgresql.Driver");
			
			String url = "jdbc:postgresql://" + host + "/postgres";
			try {
				//Username/password are "postgres" ""
				conn = DriverManager.getConnection(url, "postgres", "");
			} catch (SQLException e) {
				System.out.println(e.getLocalizedMessage());
				try {
					Thread.sleep(1000);
				} catch (InterruptedException ex) {
					System.out.println(ex.getLocalizedMessage());
					System.exit(1);
				}
			}
			
			PreparedStatement st = conn.prepareStatement(
				        "CREATE TABLE IF NOT EXISTS feedbacks (name VARCHAR(255) NOT NULL, age INTEGER NOT NULL, service_name VARCHAR(255) NOT NULL, " + 
					"timeliness VARCHAR(255) NOT NULL, quality VARCHAR(255) NOT NULL, overall_satisfaction VARCHAR(255) NOT NULL, use_service_again VARCHAR(255) NOT NULL)");
			st.executeUpdate();
		} catch (ClassNotFoundException e) {
			System.out.println(e.getLocalizedMessage());
			System.exit(1);
		}
		
		return conn;
	}

	//host: redis
	private static Jedis connectToRedis(String host) {
		
		Jedis conn = new Jedis(host);
		
		while (true) {
			try {
				conn.keys("*");
				break;
			} catch (JedisConnectionException e) {
				System.out.println(e.getLocalizedMessage());
				try {
					Thread.sleep(1000);
				} catch (InterruptedException ex) {
					System.out.println(ex.getLocalizedMessage());
					System.exit(1);
				}
			}
		}
		
		return conn;
	}

}
