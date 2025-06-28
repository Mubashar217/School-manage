'use client'

import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import mockClassesData from '@/utils/mockClassesData';

const StudentForm = ({ closeForm }) => {
  const [classRoomsData, setClassRoomsData] = useState([]);

  useEffect(() => {
    const fetchClassRooms = async () => {
      const res = await mockClassesData();
      setClassRoomsData(res);
    };
    fetchClassRooms();
  }, []);

  const initialFormData = {
    fullName: '',
    email: '',
    password: '',
    class: '',
    gender: '',
    subject: '',
    salary: '',
    phoneNumber: '',
    designation: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'students'), {
        name: formData.fullName,
        email: formData.email,
        class: formData.class,
        gender: formData.gender,
        subject: formData.subject || '',
        contact: formData.phoneNumber,
        timestamp: serverTimestamp(),
      });

      alert('Student added successfully');
      setFormData(initialFormData);
      closeForm(); // modal close
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Something went wrong while saving data');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 z-50">
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
      />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
      />
      <select
        name="class"
        value={formData.class}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
      >
        <option value="">Class</option>
        {classRoomsData.map((item, index) => (
          <option key={index} value={item.class}>{item.class}</option>
        ))}
      </select>
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
      >
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Student
      </button>
    </form>
  );
};

export default StudentForm;
