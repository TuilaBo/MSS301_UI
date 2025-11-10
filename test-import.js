// Test import của lessonService
import { lessonService } from './src/service/lessonService.js';

console.log('=== TESTING LESSONSERVICE IMPORT ===');
console.log('lessonService object:', lessonService);
console.log('Available methods:');
console.log('- getAllLessons:', typeof lessonService.getAllLessons);
console.log('- getAllPublicLessons:', typeof lessonService.getAllPublicLessons);
console.log('- getLessonById:', typeof lessonService.getLessonById);
console.log('- createLesson:', typeof lessonService.createLesson);
console.log('- updateLesson:', typeof lessonService.updateLesson);
console.log('- deleteLesson:', typeof lessonService.deleteLesson);
console.log('- searchLessons:', typeof lessonService.searchLessons);
console.log('- getLessonsByType:', typeof lessonService.getLessonsByType);
console.log('- getLessonsByGrade:', typeof lessonService.getLessonsByGrade);
console.log('- filterLessons:', typeof lessonService.filterLessons);
console.log('- testConnection:', typeof lessonService.testConnection);

console.log('=== ALL METHODS ===');
console.log(Object.keys(lessonService));