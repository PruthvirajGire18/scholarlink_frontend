import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getApprovedScholarships } from "../../services/studentService";
import ScholarshipDetail from "./ScholarshipDetail";
import MyAssistance from "./MyAssistance";

function ScholarshipList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getApprovedScholarships().then(setData);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Available Scholarships</h2>
        <button
          onClick={() => navigate("/student/assistance")}
          className="text-indigo-600 font-medium"
        >
          My assistance requests
        </button>
      </div>

      {data.length === 0 && <p>No scholarships available</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {data.map((s) => (
          <div
            key={s._id}
            onClick={() => navigate(`/student/scholarships/${s._id}`)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md border border-transparent hover:border-indigo-200"
          >
            <h3 className="font-semibold">{s.title}</h3>
            <p>Amount: ₹{s.amount}</p>
            <p>Deadline: {new Date(s.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Routes>
      <Route index element={<ScholarshipList />} />
      <Route path="scholarships/:id" element={<ScholarshipDetail />} />
      <Route path="assistance" element={<MyAssistance />} />
    </Routes>
  );
}
