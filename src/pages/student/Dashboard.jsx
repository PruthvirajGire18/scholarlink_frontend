import { useEffect, useState } from "react";
import { getApprovedScholarships } from "../../services/studentService";

export default function StudentDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getApprovedScholarships().then(setData);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Available Scholarships
      </h2>

      {data.length === 0 && <p>No scholarships available</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {data.map((s) => (
          <div
            key={s._id}
            className="bg-white p-4 rounded shadow"
          >
            <h3 className="font-semibold">{s.title}</h3>
            <p>Amount: ₹{s.amount}</p>
            <p>
              Deadline:{" "}
              {new Date(s.deadline).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
