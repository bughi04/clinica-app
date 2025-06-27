import React, { Component } from 'react';
import { Card, Descriptions, Tag, Timeline, Alert, Tabs, Spin } from 'antd';
import { ExclamationCircleOutlined, HeartOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import ApiService from "../../services/apiService.js";
const { TabPane } = Tabs;

class PatientProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            patient: null,
            questionnaire: null,
            medicalHistory: [],
            loading: true
        };
    }

    componentDidMount() {
        this.loadPatientData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.patientId !== this.props.patientId) {
            this.loadPatientData();
        }
    }

    loadPatientData = async () => {

        if (!this.props.patientId) return; // Ensure a patientId is provided

        this.setState({ loading: true });
        try {
            const response = await ApiService.getPatientProfile(this.props.patientId);
            console.log('API Response:', response); // Debug API response

            const { patient, questionnaires = [] } = response;
            const questionnaire = questionnaires.length > 0
                ? questionnaires[0]
                : {}; // Get the first questionnaire, or an empty object if none exists

            console.log('Questionnaire data structure:', questionnaire); // Debug questionnaire structure
            console.log('Patient data structure:', patient); // Debug patient structure
            console.log('Number of questionnaires:', questionnaires.length); // Debug questionnaire count

            this.setState({
                patient,
                questionnaire: {
                    ...questionnaire,
                    conditii_medicale: questionnaire.conditii_medicale || {}, // Provide a fallback for conditii_medicale
                },
                loading: false,
            });
            console.log('Processed Questionnaire:', this.state.questionnaire);
        } catch (error) {
            console.error('Error loading patient profile:', error);
            this.setState({ loading: false });
        }
    };

    renderRiskAlerts = () => {
        const { questionnaire } = this.state;
        if (!questionnaire) return null;

        const alerts = [];

        if (questionnaire.anestheticReactions) {
            alerts.push({
                type: 'error',
                message: 'RISC ÎNALT: Reacții alergice la anestezie',
                description: 'Pacientul a raportat reacții adverse la anestezie în trecut.'
            });
        }

        if (questionnaire.allergies?.length > 0) {
            alerts.push({
                type: 'warning',
                message: 'Alergii cunoscute',
                description: `Alergii la: ${questionnaire.allergies.join(', ')}`
            });
        }

        if (questionnaire.heartIssues) {
            alerts.push({
                type: 'warning',
                message: 'Probleme cardiace',
                description: 'Pacientul prezintă probleme cardiace (stimulatoare, stenturi etc.)'
            });
        }

        if (questionnaire.bleedingProblems) {
            alerts.push({
                type: 'warning',
                message: 'Probleme de coagulare',
                description: 'Risc de sângerare excesivă'
            });
        }

        if (questionnaire.medicalConditions?.includes('Diabet tip 2')) {
            alerts.push({
                type: 'warning',
                message: 'Pacient diabetic',
                description: 'Risc de cicatrizare întârziată și infecții'
            });
        }

        return alerts.map((alert, index) => (
            <Alert
                key={index}
                message={alert.message}
                description={alert.description}
                type={alert.type}
                showIcon
                style={{ marginBottom: 8 }}
            />
        ));
    };

    renderBasicInfo = () => {
        const { patient, questionnaire } = this.state;
        if (!patient) return null;

        console.log('Rendering basic info - patient:', patient);
        console.log('Patient phone fields:', {
            phone: patient.phone,
            telefon: patient.telefon,
            telephone: patient.telephone
        }); // Debug phone fields

        // Try to get the registration date from different possible sources
        const registrationDate = patient.created_at || patient.createdAt || null;

        // Try to get the last completion date
        const lastCompletionDate = questionnaire?.data_completare || null;

        // Create fullName if it doesn't exist
        const displayName = patient.fullName ||
            `${patient.firstname || patient.firstName || ''} ${patient.surname || patient.lastName || ''}`.trim();

        // Get phone number from multiple possible fields
        const displayPhone = patient.phone || patient.telefon || patient.telephone || 'N/A';

        // Get email
        const displayEmail = patient.email || 'N/A';

        return (
            <Descriptions title="Informații Personale" bordered>
                <Descriptions.Item label="Nume Complet">{displayName}</Descriptions.Item>
                <Descriptions.Item label="Data Nașterii">
                    {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('ro-RO') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{displayEmail}</Descriptions.Item>
                <Descriptions.Item label="Telefon">{displayPhone}</Descriptions.Item>
                <Descriptions.Item label="Doctor">
                    {patient.doctor ?
                        (patient.doctor.fullName || `${patient.doctor.firstName || patient.doctor.firstname || ''} ${patient.doctor.lastName || patient.doctor.surname || ''}`.trim() || 'Nespecificat')
                        : 'Nespecificat'}
                </Descriptions.Item>
                <Descriptions.Item label="Înregistrat la">
                    {registrationDate ? new Date(registrationDate).toLocaleDateString('ro-RO') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ultima Completare">
                    {lastCompletionDate ? new Date(lastCompletionDate).toLocaleDateString('ro-RO') : 'N/A'}
                </Descriptions.Item>
            </Descriptions>
        );
    };

    renderMedicalInfo = () => {
        const { questionnaire } = this.state;
        if (!questionnaire) return <div>Nu există informații medicale disponibile.</div>;

        const { conditii_medicale = {}, stare_generala = {}, examen_dentar = {} } = questionnaire;
        console.log('Rendering Medical Info, Questionnaire:', questionnaire);

        // Handle Medical Conditions
        const filteredConditions = Object.entries(conditii_medicale).filter(
            ([, value]) => value && value !== "" && value.toUpperCase() !== "NU"
        );
        console.log('Filtered Conditions:', filteredConditions); // Debugging

        return (
            <div>
                {/* Render Medical Conditions */}
                <Card title="Condiții Medicale" style={{ marginBottom: 16 }}>
                    {filteredConditions.length > 0 ? (
                        <ul>
                            {filteredConditions.map(([key, value]) => (
                                <li key={key}>{key.replace(/_/g, ' ')}: {value}</li>
                            ))}
                        </ul>
                    ) : (
                        <div>Nu sunt raportate condiții medicale.</div>
                    )}
                </Card>

                {/* Render General State */}
                <Card title="Stare Generală" style={{ marginBottom: 16 }}>
                    <ul>
                        <li>În îngrijirea medic: {stare_generala.in_ingrijirea_medic || 'Nu'}</li>
                        <li>Medicamente curente: {stare_generala.medicamente_curente || 'Nu'}</li>
                        <li>Alergii: {stare_generala.lista_alergii || 'Nu sunt raportate alergii.'}</li>
                        <li>Modificări recente în starea de sănătate: {stare_generala.modificari_recente || 'Nu'}</li>
                    </ul>
                </Card>

                {/* Render Dental Examination */}
                <Card title="Examen Dentar" style={{ marginBottom: 16 }}>
                    <ul>
                        <li>Scrâșnit din dinți/inclestat maxilar: {examen_dentar.scrasnit_inclestat}</li>
                        <li>Gingiile sângerează: {examen_dentar.sangereaza_gingiile}</li>
                        <li>Sensibilitate dinți: {examen_dentar.sensibilitate_dinti}</li>
                        <li>Probleme ortodontice: {examen_dentar.probleme_ortodontice}</li>
                    </ul>
                </Card>


                {questionnaire.otherComments && (
                    <Card title="Comentarii Adiționale" style={{ marginTop: 16 }}>
                        <p>{questionnaire.otherComments}</p>
                    </Card>
                )}
            </div>
        );
    };

    renderMedicalHistory = () => {
        const { medicalHistory } = this.state;

        return (
            <Timeline>
                {medicalHistory.map((entry, index) => (
                    <Timeline.Item key={index} color={entry.type === 'treatment' ? 'green' : 'blue'}>
                        <div>
                            <strong>{entry.title}</strong>
                            <br />
                            <span style={{ color: '#666' }}>
                {new Date(entry.date).toLocaleDateString('ro-RO')}
              </span>
                            <br />
                            {entry.description}
                        </div>
                    </Timeline.Item>
                ))}
                {medicalHistory.length === 0 && (
                    <Timeline.Item>
                        <div>Nu există istoric medical disponibil.</div>
                    </Timeline.Item>
                )}
            </Timeline>
        );
    };

    render() {
        const { patient, loading } = this.state;

        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Se încarcă datele pacientului...</div>
                </div>
            );
        }

        if (!patient) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Pacientul nu a fost găsit.</h3>
                    <p>Selectați un pacient din lista de mai sus pentru a vizualiza profilul.</p>
                </div>
            );
        }

        return (
            <div className="patient-profile">
                <div style={{ marginBottom: 24 }}>
                    {this.renderRiskAlerts()}
                </div>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="Informații Generale" key="1">
                        {this.renderBasicInfo()}
                    </TabPane>

                    <TabPane tab="Date Medicale" key="2">
                        {this.renderMedicalInfo()}
                    </TabPane>

                    <TabPane tab="Istoric Medical" key="3">
                        {this.renderMedicalHistory()}
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default PatientProfile;