import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  ReusableDialogComponent,
  ReusableDialogConfig,
  ReusableInput,
  ReusableCheckBox,
  ReusableTabs,
  ReusableTab,
  ReusableText
} from './reusable-dialog/reusable-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private dialog: MatDialog) {}

  openDialog() {
    const tab1 = new ReusableTab('Tab 1', [
      new ReusableInput('tabInput', 'Input in Tab'),
      new ReusableCheckBox('tabCheck', 'Check me')
    ]);

    const tab2 = new ReusableTab('Tab 2', [
      new ReusableText('Text in second tab')
    ]);

    const config = new ReusableDialogConfig([
      new ReusableInput('name', 'Name'),
      new ReusableTabs([tab1, tab2]),
      new ReusableCheckBox('accept', 'Accept?')
    ], {});

    config.dialogTitle = 'Reusable Dialog Example';

    this.dialog.open(ReusableDialogComponent, { data: config });
  }
}
