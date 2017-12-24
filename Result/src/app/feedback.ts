export class Feedback {
    constructor(
        public name: string,
        public age: number,
        public service_name: string,
        public timeliness: string,
        public quality: string,
        public overall_satisfaction: string,
        public use_service_again: string,
        public id?: number
    ){ }
}
