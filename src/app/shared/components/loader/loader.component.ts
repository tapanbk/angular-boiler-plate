import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from "../../services/loader.service";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {

  loading: boolean;
  private loadingSubscriber: Subscription;

  constructor(private loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.loadingSubscriber = this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });
  }

  ngOnDestroy(): void {
    this.loadingSubscriber.unsubscribe();
  }

}
