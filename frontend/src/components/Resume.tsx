import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import { getResumeById, updateResume, getStates } from "../services/api";
import { Resume } from "../../../interfaces/Resume";
import { loadUserFromStorage } from "../utils/storage";
import { User } from "../../../interfaces/User";

const ResumePage: React.FC = () => {
  const { resumeId } = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [states, setStates] = useState<{ stateid: number; text: string }[]>([]);
  const [selectedState, setSelectedState] = useState<number >(0);
  const [comment, setComment] = useState("");
  console.log("resumeId:", resumeId||"kein ID" );
  useEffect(() => {
    console.log("resumeId:", resumeId||"kein ID" );
    const fetchData = async () => {
      try {
        if (resumeId) {
        
  
          // Prüfen, ob eine neue Bewerbung erstellt werden soll
          const resumeData = await getResumeById(Number(resumeId));
          setResume(resumeData);
          setSelectedState(resumeData.stateid);
          setComment(resumeData.comment);
        }
  
        // Statuswerte laden
        const statesData = await getStates();
        setStates(statesData);
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
      }
    };
  
    fetchData();
  }, [resumeId]);
  

  const storedUser:User = loadUserFromStorage(); // Holt gespeicherte Nutzerdaten
  const handleSave = () => {
    console.log("storedUser:", storedUser );
    if( selectedState !== null && storedUser!=null&&storedUser?.loginid) {
      const updatedResume: Resume = {
        resumeid: Number(resumeId),
        userid: Number(storedUser?.loginid) || 0, // Holt `userid` aus Storage
        position: resume?.position ?? "",
        created: resume?.created ?? "",
        stateid: selectedState ||0,
        comment: comment,
        companyid: resume?.companyid ||0,
        parentcompanyid: resume?.parentcompanyid || 0,
        link: resume?.link ?? "",
      };
  
      updateResume(updatedResume)
        .then(() => alert("Änderungen gespeichert!"))
        .catch((err) => alert(`Fehler beim Speichern: ${err.message}`));
    } else {
      alert("Fehlende Resume-ID :"+ resumeId+" oder Nutzer-ID:"+ storedUser?.loginid);
    }
  };
  if (!resume) return <p>Lädt...{resumeId || "kein ID"}</p>;

  return (
    <Container>
      <h2>Bewerbung: {resume.position}</h2>
      <p>Unternehmen: {resume.companyid}</p>
      <p>Mutterfirma: {resume.parentcompanyid}</p>
      <p>Erstellt am: {resume.created}</p>
     <p>Status: {resume.stateid}</p> 
      <Form.Group>
        <Form.Label>Status:</Form.Label>
        <Form.Select value={selectedState ?? ""} onChange={(e) => setSelectedState(Number(e.target.value))}>
          {states.map((state) => (
            <option key={state.stateid} value={state.stateid}>
              {state.text}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mt-3">
        <Form.Label>Kommentar:</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Form.Group>

      <Button className="mt-3" onClick={handleSave}>
        Speichern
      </Button>
    </Container>
  );
};

export default ResumePage;