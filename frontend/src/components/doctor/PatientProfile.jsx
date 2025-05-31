import React, { Component } from 'react';
import { Card, Descriptions, Tag, Timeline, Alert, Tabs, Spin } from 'antd';
import { ExclamationCircleOutlined, HeartOutlined, MedicineBoxOutlined } from '@ant-design/icons';

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
        if (!this.props.patientId) return;

        this.setState({ loading: true });
        try {
            // Mock patient data based on patientId
            const mockPatients = {
                '1': {
                    id: '1',
                    fullName: 'Maria Popescu',
                    birthDate: '1985-03-15',
                    email: 'maria.popescu@email.com',
                    phone: '0740123456',
                    createdAt: '2024-01-15T10:00:00Z'
                },
                '2': {
                    id: '2',
                    fullName: 'Ion Ionescu',
                    birthDate: '1978-07-22',
                    email: 'ion.ionescu@email.com',
                    phone: '0741234567',
                    createdAt: '2024-02-10T14:30:00Z'
                },
                '3': {
                    id: '3',
                    fullName: 'Ana Testescu',
                    birthDate: '1990-12-10',
                    email: 'ana.test@email.com',
                    phone: '0742345678',
                    createdAt: '2024-03-05T09:15:00Z'
                }
            };

            const mockQuestionnaires = {
                '1': {
                    patientId: '1',
                    submissionDate: new Date().toISOString(),
                    medicalConditions: ['Hipertensiune arterială'],
                    currentTreatments: ['Enalapril 10mg'],
                    allergies: ['Penicilină', 'Polen'],
                    smoking: false,
                    alcoholUse: false,
                    pregnancyStatus: false,
                    recentHospitalizations: false,
                    recentSurgeries: false,
                    heartIssues: false,
                    anestheticReactions: false,
                    bleedingProblems: false,
                    otherComments: 'Pacientă cooperantă, fără alte observații medicale.'
                },
                '2': {
                    patientId: '2',
                    submissionDate: new Date(Date.now() - 86400000).toISOString(),
                    medicalConditions: ['Diabet tip 2'],
                    currentTreatments: ['Metformin 500mg', 'Insulină'],
                    allergies: [],
                    smoking: true,
                    alcoholUse: false,
                    pregnancyStatus: false,
                    recentHospitalizations: true,
                    recentSurgeries: false,
                    heartIssues: true,
                    anestheticReactions: false,
                    bleedingProblems: false,
                    otherComments: 'Pacient diabetic cu control glicemic instabil. Necesită monitorizare atentă.'
                },
                '3': {
                    patientId: '3',
                    submissionDate: new Date(Date.now() - 172800000).toISOString(),
                    medicalConditions: [],
                    currentTreatments: [],
                    allergies: [],
                    smoking: false,
                    alcoholUse: false,
                    pregnancyStatus: false,
                    recentHospitalizations: false,
                    recentSurgeries: false,
                    heartIssues: false,
                    anestheticReactions: false,
                    bleedingProblems: false,
                    otherComments: 'Pacientă sănătoasă, fără antecedente medicale relevante.'
                }
            };

            const mockHistory = {
                '1': [
                    {
                        id: 1,
                        type: 'questionnaire',
                        title: 'Chestionar medical completat',
                        date: new Date().toISOString(),
                        description: 'Chestionar medical și consimțământ GDPR semnat digital'
                    },
                    {
                        id: 2,
                        type: 'treatment',
                        title: 'Consultație inițială',
                        date: new Date(Date.now() - 86400000).toISOString(),
                        description: 'Prima consultație, evaluare stare dentară generală'
                    }
                ],
                '2': [
                    {
                        id: 1,
                        type: 'questionnaire',
                        title: 'Chestionar medical actualizat',
                        date: new Date(Date.now() - 86400000).toISOString(),
                        description: 'Actualizare date medicale - diabet tip 2 confirmat'
                    },
                    {
                        id: 2,
                        type: 'treatment',
                        title: 'Tratament endodontic',
                        date: new Date(Date.now() - 172800000).toISOString(),
                        description: 'Tratament de canal molar inferior drept'
                    },
                    {
                        id: 3,
                        type: 'treatment',
                        title: 'Control post-tratament',
                        date: new Date(Date.now() - 259200000).toISOString(),
                        description: 'Verificare cicatrizare și adaptare proteză'
                    }
                ],
                '3': [
                    {
                        id: 1,
                        type: 'questionnaire',
                        title: 'Primul chestionar medical',
                        date: new Date(Date.now() - 172800000).toISOString(),
                        description: 'Înregistrare pacient nou - fără antecedente medicale'
                    }
                ]
            };

            const patient = mockPatients[this.props.patientId];
            const questionnaire = mockQuestionnaires[this.props.patientId];
            const medicalHistory = mockHistory[this.props.patientId] || [];

            this.setState({
                patient,
                questionnaire,
                medicalHistory,
                loading: false
            });
        } catch (error) {
            console.error('Error loading patient data:', error);
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

        return (
            <Descriptions title="Informații Personale" bordered>
                <Descriptions.Item label="Nume Complet">{patient.fullName}</Descriptions.Item>
                <Descriptions.Item label="Data Nașterii">
                    {new Date(patient.birthDate).toLocaleDateString('ro-RO')}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{patient.email}</Descriptions.Item>
                <Descriptions.Item label="Telefon">{patient.phone}</Descriptions.Item>
                <Descriptions.Item label="Înregistrat la">
                    {new Date(patient.createdAt).toLocaleDateString('ro-RO')}
                </Descriptions.Item>
                <Descriptions.Item label="Ultima Completare">
                    {questionnaire ? new Date(questionnaire.submissionDate).toLocaleDateString('ro-RO') : 'N/A'}
                </Descriptions.Item>
            </Descriptions>
        );
    };

    renderMedicalInfo = () => {
        const { questionnaire } = this.state;
        if (!questionnaire) return <div>Nu există informații medicale disponibile.</div>;

        return (
            <div>
                <Card title="Condiții Medicale" style={{ marginBottom: 16 }}>
                    {questionnaire.medicalConditions?.length > 0 ? (
                        <div>
                            {questionnaire.medicalConditions.map((condition, index) => (
                                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                    {condition}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        <div>Nu sunt raportate condiții medicale cronice.</div>
                    )}
                </Card>

                <Card title="Tratamente Curente" style={{ marginBottom: 16 }}>
                    {questionnaire.currentTreatments?.length > 0 ? (
                        <div>
                            {questionnaire.currentTreatments.map((treatment, index) => (
                                <Tag key={index} color="green" icon={<MedicineBoxOutlined />} style={{ marginBottom: 4 }}>
                                    {treatment}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        <div>Nu sunt raportate tratamente curente.</div>
                    )}
                </Card>

                <Card title="Alergii" style={{ marginBottom: 16 }}>
                    {questionnaire.allergies?.length > 0 ? (
                        <div>
                            {questionnaire.allergies.map((allergy, index) => (
                                <Tag key={index} color="red" icon={<ExclamationCircleOutlined />} style={{ marginBottom: 4 }}>
                                    {allergy}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        <div>Nu sunt raportate alergii.</div>
                    )}
                </Card>

                <Descriptions title="Informații Adiționale" bordered>
                    <Descriptions.Item label="Fumător">
                        {questionnaire.smoking ? 'Da' : 'Nu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Consumă alcool">
                        {questionnaire.alcoholUse ? 'Da' : 'Nu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sarcină (femei)">
                        {questionnaire.pregnancyStatus ? 'Da' : 'Nu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Spitalizări recente">
                        {questionnaire.recentHospitalizations ? 'Da' : 'Nu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chirurgii recente">
                        {questionnaire.recentSurgeries ? 'Da' : 'Nu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Probleme cardiace" span={2}>
                        {questionnaire.heartIssues ? 'Da' : 'Nu'}
                    </Descriptions.Item>
                </Descriptions>

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