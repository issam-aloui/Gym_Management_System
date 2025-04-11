/*
  id: ObjectId,
  title: String,
  gymId: ObjectId,
  trainerId: ObjectId, // references User
  startTime: Date,
  endTime: Date,
  capacity: Number,
  enrolledUsers: [ObjectId], // references User
}
*/