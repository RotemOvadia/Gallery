import { Inject, Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Image } from './image.model';
import { SortOption } from './sort-option';
import { Observable } from 'rxjs';
import { startWith, map, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog/image-dialog.component';
import { LOCAL_STORAGE } from 'ngx-webstorage-service';
import { StorageService } from 'ngx-webstorage-service/src/storage.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  @Input() feedPath: string|Array<any>;
  @Input() search: boolean = true;
  @Input() pagination: boolean = true;
  @Input() resultsPerPage: number = 10;
  @Input() sorting: boolean = true;
  @Input() autoRotateTime: number = 4;
  imagesArray: Array<Image> = [];
  filteredImagesArray: Array<Image> = [];
  imagesShowArray: Array<Image> = [];
  sortOptions: SortOption[] = [
    {value: 'title', viewValue: 'Title'},
    {value: 'date', viewValue: 'Date'}
  ];
  resultsPerPageOptions: Number[] = [5, 10, 15, 20];
  myControl = new FormControl();
  filteredImages: Observable<Image[]>;

  public currentPage = 0;
  public totalSize = 0;
  
  sortingFunctions: any = {
    title: (a,b) => a.title.localeCompare(b.title),
    date: (a, b) => {return <any>new Date(b.date) - <any>new Date(a.date);}
  };
  
  constructor(private http: HttpClient, 
    public dialog: MatDialog,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private socket: Socket
    ) { }

  ngOnInit(): void {
      if (Array.isArray(this.feedPath)) {
        this.createImages(this.feedPath);
      }
      else if (typeof this.feedPath === 'string') {
        let headers = new HttpHeaders();
        headers = headers.set('Access-Control-Allow-Origin', '*');
        this.http.get(this.feedPath,{ 'headers': headers }).subscribe((imagesData:Array<any>) => 
        this.createImages(imagesData));

        this.socket.emit("getImages");
      }
      //this.filteredImages = this.myControl.valueChanges{}

  }

  private createImages(imagesData:Array<any>) {
    imagesData.forEach((imageJson: string, index: number) => {
      if (this.storage.get(imageJson['title'])!==true) {
        this.imagesArray.push(new Image(index.toString(),imageJson['title'], new Date(imageJson['date']), imageJson['url']));
        this.filteredImages = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value)),
          tap(images=>this.filteredImagesArray = images),
          tap(()=>this.onLayoutChange())
        );
      }
    });
  }

  private _filter(value: any): Image[] {
    if (value instanceof Image )
      value = value.title;
    const filterValue = value.toLowerCase();
    this.currentPage=0;
    return this.imagesArray.filter(image => image.title.toLowerCase().includes(filterValue));
  }

  onSortOptionChange(sortOptions: SortOption) {
    this.imagesArray.sort(this.sortingFunctions[sortOptions.value]);
    this.filteredImagesArray.sort(this.sortingFunctions[sortOptions.value]);
    this.currentPage = 0;
    this.onLayoutChange();

  }

  onImageClicked(clickedImage: Image)
  {
    let imageIndex = this.imagesArray.indexOf(clickedImage);
    this.openSlideShowDialog(imageIndex, clickedImage, false);
  }

  onSlideShowClicked()
  {
    this.openSlideShowDialog(0, this.imagesArray[0], true);
  }

  private openSlideShowDialog(imageIndex:number, activeImage:Image,startSlideShow:boolean){
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: '90vh',
      height: '90vh',
      panelClass: 'my-dialog',
      data: {
        imagesArray: this.imagesArray, 
        activeImageIndex: imageIndex, 
        image:activeImage,
        slideShow:startSlideShow,
        autoRotateTime:this.autoRotateTime
      }
    });
  }

  public handlePage(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.resultsPerPage = event.pageSize;
    this.onLayoutChange();
  }

  onLayoutChange()
  {
    let i = this.currentPage;
    let size = this.resultsPerPage;
    this.imagesShowArray = this.filteredImagesArray.slice(i*size,(i+1)*size);
  }

  getOptionText(option) {
    if (option!=null)
      return option.title;
    return "";
  }

  onDeleteImageClick(image: Image) {
    this.storage.set(image.title, true);
    this.imagesArray.splice(this.imagesArray.indexOf(image),1);
    this.filteredImagesArray.splice(this.filteredImagesArray.indexOf(image),1);
    this.onLayoutChange();
  }

  onDeleteSearchClick() {
    this.myControl.setValue("");
  }
}
