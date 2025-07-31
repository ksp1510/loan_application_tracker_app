import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  styleUrls: ['./application-details.component.css']
})
export class ApplicationDetailsComponent implements OnInit {
  application: any;
  notes: string = '';
  files: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.applicationService.getApplicationById(id).subscribe((data) => {
        this.application = data;
        this.notes = data.notes;
      });
    }
  }

  onFileSelected(event: any) {
    this.files = event.target.files;
  }

  uploadFiles() {
    if (this.files.length === 0) return;
    const formData = new FormData();
    for (let file of this.files) {
      formData.append('files', file);
    }
    this.applicationService.uploadFiles(this.application.id, formData).subscribe(
      (response) => {
        console.log('Files uploaded successfully', response);
        alert('Files uploaded successfully');
      },
      (error) => {
        console.error('File upload failed', error);
        alert('File upload failed');
      }
    );
  }

  saveNotes() {
    this.applicationService.updateNotes(this.application.id, { notes: this.notes }).subscribe(
      (response) => {
        console.log('Notes saved successfully', response);
        alert('Notes saved successfully');
      },
      (error) => {
        console.error('Failed to save notes', error);
        alert('Failed to save notes');
      }
    );
  }
}