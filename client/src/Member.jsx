import { useEffect, useState } from "react";
import axios from "axios";

function Member() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const res = await axios.get("http://localhost:5000/api/members");
    setMembers(res.data);
  };

  const addMember = async () => {
    await axios.post("http://localhost:5000/api/members", {
      name,
      email,
      phone,
    });

    fetchMembers();
  };

  const deleteMember = async (id) => {
    await axios.delete(`http://localhost:5000/api/members/${id}`);
    fetchMembers();
  };

  return (
    <div>
      <h2>👥 Members</h2>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />

      <button onClick={addMember}>Add Member</button>

      <hr />

      {members.map((m) => (
        <div key={m._id}>
          <h3>{m.name}</h3>
          <p>{m.email}</p>
          <p>{m.phone}</p>

          <button onClick={() => deleteMember(m._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Member;