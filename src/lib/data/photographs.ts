import type { Photograph } from '$lib/types/library.js';

// Using existing images from $lib/images with enhanced-img
import hackathonImg from '$lib/images/end-of-year-team-hackathon-in-december-2021.jpg?enhanced';
import medicineOfficeImg from '$lib/images/guests-touring-the-traditional-chinese-medicine-office.jpg?enhanced';
import claimsImg from '$lib/images/it\'s-easy-to-submit-claims-online!.jpg?enhanced';

export const photographs: Photograph[] = [
  {
    id: 'photo-1',
    type: 'photograph',
    title: 'End of Year Team Hackathon',
    date: '2021-12-15T18:00:00Z',
    imagePath: 'end-of-year-team-hackathon-in-december-2021.jpg',
    enhancedImage: hackathonImg,
    caption: 'Team collaboration and innovation during our December hackathon',
    location: 'Office, San Francisco',
    camera: 'iPhone 12 Pro',
    review: 'Great energy and creativity from the whole team. Love these collaborative sessions.'
  },
  {
    id: 'photo-2',
    type: 'photograph',
    title: 'Traditional Chinese Medicine Office Tour',
    date: '2023-03-10T14:30:00Z',
    imagePath: 'guests-touring-the-traditional-chinese-medicine-office.jpg',
    enhancedImage: medicineOfficeImg,
    caption: 'Guests exploring traditional medicine practices and facilities',
    location: 'TCM Clinic, Beijing',
    camera: 'Canon EOS R6',
    review: 'Fascinating look into traditional healing methods. Great learning experience.'
  },
  {
    id: 'photo-3',
    type: 'photograph',
    title: 'Online Claims Submission',
    date: '2023-08-22T11:15:00Z',
    imagePath: 'it\'s-easy-to-submit-claims-online!.jpg',
    enhancedImage: claimsImg,
    caption: 'Demonstrating the ease of digital claims processing',
    location: 'Home Office',
    camera: 'MacBook Pro Camera',
    review: 'Simple and intuitive interface design. User experience keeps improving.'
  }
];
