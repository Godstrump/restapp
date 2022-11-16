import { Component } from '@angular/core';
import { PickerController } from '@ionic/angular';
import { HomeService } from './home.service';
import { Insomnia } from '@awesome-cordova-plugins/insomnia/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  selectedTimes: string = '01:30';
  percent: number = 0;
  radius: number = 100;

  timer: any = false;
  progress: number = 0;
  seconds: number = 1;
  minutes: number = 30;

  elapsed: any = {
    h: '00',
    m: '00',
    s: '00',
  };

  overAllTimer: any = false;

  constructor(
    private pickerController: PickerController,
    private homeService: HomeService,
    private insomnia: Insomnia
  ) {}

  handleEvent(e: Event): void {
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  startTimer(e: Event): void {
    if (this.timer) clearInterval(this.timer);
    if (!this.overAllTimer) {
      this.progressTimer();
      this.insomnia.keepAwake();
    }

    this.handleEvent(e);
    this.timer = false;
    this.percent = 0;
    this.progress = 0;

    const timesplit = this.selectedTimes.split(':');
    this.minutes = +timesplit[0];
    this.seconds = +timesplit[1];

    const totalSeconds = Math.floor(this.minutes * 60) + +this.seconds;

    this.timer = setInterval(() => {
      if (this.percent === this.radius) clearInterval(this.timer);

      this.percent = Math.floor((this.progress / totalSeconds) * 100);
      this.progress++;
    }, 1000);
  }

  async openPicker(e: Event) {
    this.handleEvent(e);
    const picker = await this.pickerController.create({
      buttons: [
        {
          text: 'Confirm',
          handler: (selected) => {
            this.selectedTimes = `${selected.minutes.value}:${selected.seconds.value}`;
          },
        },
      ],
      columns: [
        {
          name: 'minutes',
          options: [...this.homeService._timers],
        },
        {
          name: 'seconds',
          options: [...this.homeService._timers],
        },
      ],
    });
    await picker.present();
  }

  progressTimer() {
    let countDownDate = new Date();

    this.overAllTimer = setInterval(() => {
      let now = new Date().getTime();

      // Find the distance between now an the count down date
      var distance = now - countDownDate.getTime();

      // Time calculations for hours, minutes and seconds

      this.elapsed.h = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      this.elapsed.m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.elapsed.s = Math.floor((distance % (1000 * 60)) / 1000);

      this.elapsed.h = this.pad(this.elapsed.h, 2);
      this.elapsed.m = this.pad(this.elapsed.m, 2);
      this.elapsed.s = this.pad(this.elapsed.s, 2);
    }, 1000);
  }

  pad(num: unknown, size: number): string {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  stopTimer(e: Event): void {
    clearInterval(this.timer);
    clearInterval(this.overAllTimer);
    this.percent = 0;
    this.timer = false;
    this.overAllTimer = false;
    this.progress = 0;

    this.elapsed = {
      h: '00',
      m: '00',
      s: '00',
    };

    this.insomnia.allowSleepAgain();
  }
}
