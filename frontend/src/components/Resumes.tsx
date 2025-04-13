import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Table, Dropdown } from "react-bootstrap";
import { getResumesWithUsers, getUserData } from "../services/api"; // Import der API-Funktion
import { Resume } from "../../../interfaces/Resume";
import { loadUserFromStorage } from "../utils/storage";
import { User } from "../../../interfaces/User";

const storedUser:User = loadUserFromStorage();

const getLoggedInUserId = (): number | null => {
  if (storedUser) {
    return storedUser.loginid;
  }
  
  return  null;
};


const Resumes: React.FC = () => {
  const [userLoginName, setUserLoginName] = useState("");

  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    const userId = storedUser?.loginid;
  
    if (userId) {
      setUserLoginName(storedUser.name || storedUser.loginname);
      getResumesWithUsers(userId)
        .then((data) => setResumes(data))
        .catch((err) => console.error("Fehler beim Laden der Bewerbungen:", err));
    }
  }, []);
  
  return (
    <Container>
      <Navbar bg="dark" variant="dark" className="mb-3">
        <Navbar.Brand>Bewerbungen {userLoginName}</Navbar.Brand>
        <Nav className="ms-auto">
          <Dropdown>
            <Dropdown.Toggle variant="light">
              <i className="fas fa-bars"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
            <Dropdown.Item as="a" href="/resume/0">
  Neue Bewerbung
</Dropdown.Item>
              <Dropdown.Item>Profil editieren</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Aktion</th>
            <th>Position</th>
            <th>Unternehmen</th>
            <th>Mutterfirma</th>
            <th>Status</th>
            <th>Erstellt</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume) => (
            <tr key={resume.resumeid}>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary">
                    <i className="fas fa-ellipsis-v"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Anschauen/Ändern</Dropdown.Item>
                    <Dropdown.Item>Status ändern</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
              <td>{resume.position}</td>
              <td>{resume.companyid}</td>
              <td>{resume.parentcompanyid}</td>
              <td>{resume.stateid}</td>
              <td>{resume.created}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Resumes;