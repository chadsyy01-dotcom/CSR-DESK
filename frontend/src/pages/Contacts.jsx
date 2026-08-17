import { useEffect, useState } from "react";
import api from "../api";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    api.get("/contacts").then((res) => setContacts(res.data));
  }, []);

  return (
    <>
      <div className="topbar">
        <h1>Contacts</h1>
      </div>
      <div className="page-body">
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Conversations</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.conversationCount}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>
                    Wala pang contact.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
