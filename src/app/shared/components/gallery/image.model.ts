export class Image {
    id:string;
    title:string;
    date:Date;
    url:string;

    constructor(id:string, title: string, date: Date, url: string) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.url = url;
    }
}
