import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get(
      "http://new-login-page-backend.vercel.app/data"
    );
    setUsers(res.data);
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(
        `http://new-login-page-backend.vercel.app/delete/${index}`
      );
      setUsers(users.filter((_, i) => i !== index)); // update UI
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={idx} className="text-center border-b">
              <td className="p-2 border">{user[0]}</td>
              <td className="p-2 border">{user[1]}</td>
              <td className="p-2 border">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(idx)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
