import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { interval } from 'rxjs';
import { Image } from '../image.model';

export interface DialogData {
  imagesArray: Image[];
  activeImageIndex: number;
  image: Image;
  autoRotateTime:number;
  slideShow:boolean;
}

@Component( {
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    // Subscribe to begin publishing values
    if (this.data.slideShow){
      interval(this.data.autoRotateTime*1000).subscribe(() =>
        this.onNextClick());
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onPrevClick(): void {
    if (this.data.activeImageIndex==0)
      this.data.activeImageIndex=this.data.imagesArray.length-1;
    else
      this.data.activeImageIndex--;
    this.data.image = this.data.imagesArray[this.data.activeImageIndex];
  }

  onNextClick(): void {
    if (this.data.activeImageIndex==this.data.imagesArray.length-1)
      this.data.activeImageIndex=0;
    else
      this.data.activeImageIndex++;
    this.data.image = this.data.imagesArray[this.data.activeImageIndex];  }
}
