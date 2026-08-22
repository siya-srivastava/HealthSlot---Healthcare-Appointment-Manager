import React, { useState } from 'react';
import { Search, Stethoscope, Clock, Calendar, ChevronRight, User } from 'lucide-react';

const SPECIALTIES = [
  'All Specialties',
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Psychiatry',
];

export const DoctorSearch = ({ doctors, loading, onSelectDoctor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');

  const filteredDoctors = doctors.filter((doc) => {
    const nameMatch = doc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const specMatch = doc.specialisation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || specMatch;

    if (selectedSpecialty === 'All Specialties') return matchesSearch;
    return matchesSearch && doc.specialisation?.toLowerCase() === selectedSpecialty.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctors by name or specialization..."
              className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Quick specialty filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Finding available physicians...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword or selecting a different specialty filter.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg shadow-inner">
                      {doc.user?.name ? doc.user.name.charAt(0) : 'D'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Dr. {doc.user?.name || 'Practicing Specialist'}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mt-0.5">
                        {doc.specialisation}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {doc.slotDurationMins || 30} min visits
                  </span>
                </div>

                {/* Schedule details */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>
                      Working Hours:{' '}
                      <strong className="text-slate-800">
                        {doc.workingHours?.start} - {doc.workingHours?.end}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500">Available Days: </span>
                      <span className="font-semibold text-slate-700">
                        {doc.workingDays?.join(', ') || 'All weekdays'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book slot button */}
              <div className="mt-4 pt-2 flex items-center justify-end">
                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>Check Availability & Book</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
