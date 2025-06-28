'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BiSolidSearchAlt2 } from 'react-icons/bi';
import { db } from '@/app/firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Papa from 'papaparse';
import Image from 'next/image';
import StudentForm from '@/components/StudentForm';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [user, setUser] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formToggle, setFormToggle] = useState(false);

  const formRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (!userInfo) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(userInfo));
    }
  }, [router]);

  const handleDownload = () => {
    const csvString = Papa.unparse({
      fields: ['Id', 'Name', 'Subject', 'Class', 'Email', 'Gender', 'Year Joined', 'Contact'],
      data: studentsData.map((student) => [
        student.id,
        student.name,
        student.subject,
        student.class,
        student.email,
        student.gender,
        student.yearJoined,
        student.contact,
      ]),
    });

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'students'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudentsData(students);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = studentsData.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const toggleForm = () => {
    setFormToggle((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      setFormToggle(false);
    }
  };

  useEffect(() => {
    if (formToggle) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [formToggle]);

  if (!user) return null;

  return (
    <div className="flex flex-col px-5 sm:px-10 py-8 w-full h-screen overflow-y-auto relative gap-6 bg-gray-50">
      {/* Modal */}
      {formToggle && (
        <div className="fixed inset-0 bg-black/40 z-20 grid place-items-center p-4">
          <div ref={formRef} className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
            <StudentForm closeForm={() => setFormToggle(false)} />
          </div>
        </div>
      )}

      {/* Top Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition shadow-sm"
        >
          Add Student
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 px-5 py-2 rounded-lg hover:bg-indigo-50 transition"
        >
           Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mt-2">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name, email, class..."
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
        />
        <BiSolidSearchAlt2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 text-xl" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 italic">Fetching students...</div>
      ) : (
        <div className="overflow-auto rounded-md shadow-sm bg-white mt-2">
          {filteredData.length > 0 ? (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-indigo-100 text-indigo-800 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`transition hover:bg-indigo-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-indigo-600 font-medium">{row.id}</td>
                    <td className="px-4 py-3 flex items-center gap-2 text-indigo-700 font-medium">
                      <Image
                        src={row.img || '/default-profile.png'}
                        alt="Profile"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{row.class}</td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3 text-gray-600">{row.gender}</td>
                    <td className="px-4 py-3 text-gray-600">{row.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 p-4">No students found!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
