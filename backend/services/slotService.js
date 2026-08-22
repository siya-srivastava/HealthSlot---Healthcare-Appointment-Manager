function generateSlotsForDay(workingHours, slotDurationMins, dateStr) {
  const slots = [];

  const [startHour, startMin] = workingHours.start.split(':').map(Number);
  const [endHour, endMin] = workingHours.end.split(':').map(Number);

  let current = new Date(dateStr);
  current.setHours(startHour, startMin, 0, 0);

  const endTime = new Date(dateStr);
  endTime.setHours(endHour, endMin, 0, 0);

  while (current < endTime) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + slotDurationMins * 60000);
    slots.push({ slotStart, slotEnd });
    current = slotEnd;
  }

  return slots;
}

module.exports = { generateSlotsForDay };