import React, { Component } from 'react';
import { Card, Row, Col, Statistic, Alert, List, Button, Space, Spin, message } from 'antd';
import { UserOutlined, FileTextOutlined, WarningOutlined, CalendarOutlined, HeartOutlined } from '@ant-design/icons';
import ApiService from '../../services/apiService';

class DoctorDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statistics: {
                totalPatients: 0,
                pendingQuestionnaires: 0,
                riskPatients: 0,
                todayAppointments: 0,
                questionnaireStats: {}
            },
            recentQuestionnaires: [],
            riskAlerts: [],
            highPriorityAlerts: [],
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        this.loadDashboardData();
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(this.loadDashboardData, 5 * 60 * 1000);
    }

    componentWillUnmount() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    loadDashboardData = async () => {
        try {
            this.setState({ loading: true, error: null });

            // Fetch real data from database
            const [
                dashboardStats,
                recentQuestionnaires,
                highPriorityAlerts,
                highRiskPatients
            ] = await Promise.all([
                ApiService.getDashboardStats(),
                ApiService.getRecentQuestionnaires(5),
                ApiService.getHighPriorityAlerts(),
                ApiService.getHighRiskPatients()
            ]);

            console.log('Dashboard data loaded:', {
                dashboardStats,
                recentQuestionnaires,
                highPriorityAlerts,
                highRiskPatients
            });

            this.setState({
                statistics: {
                    totalPatients: dashboardStats.totalPatients || 0,
                    pendingQuestionnaires: dashboardStats.pendingQuestionnaires || 0,
                    riskPatients: dashboardStats.riskPatients || 0,
                    todayAppointments: dashboardStats.todayAppointments || 0,
                    questionnaireStats: dashboardStats.questionnaireStats || {}
                },
                recentQuestionnaires: recentQuestionnaires || [],
                highPriorityAlerts: highPriorityAlerts || [],
                riskAlerts: highRiskPatients?.slice(0, 5) || [],
                loading: false
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            message.error('Eroare la încărcarea datelor dashboard');
            this.setState({
                loading: false,
                error: 'Eroare la încărcarea datelor din baza de date'
            });
        }
    };

    formatRiskLevel = (riskLevel) => {
        const riskMap = {
            'minimal': { text: 'Minimal', color: 'green' },
            'low': { text: 'Scăzut', color: 'blue' },
            'medium': { text: 'Mediu', color: 'orange' },
            'high': { text: 'Înalt', color: 'red' }
        };
        return riskMap[riskLevel] || { text: 'Necunoscut', color: 'gray' };
    };

    render() {
        const {
            statistics,
            recentQuestionnaires,
            riskAlerts,
            highPriorityAlerts,
            loading,
            error
        } = this.state;

        if (loading && recentQuestionnaires.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                    <span className="ml-3">Se încarcă datele din baza de date...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8">
                    <Alert
                        message="Eroare de conectare"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={this.loadDashboardData}>
                                Reîncearcă
                            </Button>
                        }
                    />
                </div>
            );
        }

        return (
            <div className="doctor-dashboard">
                <div className="flex justify-between items-center mb-6">
                    <h1 style={{ marginBottom: 0, fontSize: 24, fontWeight: 'bold' }}>
                        Panou de Control - Dental Point Clinic
                    </h1>
                    <Button
                        onClick={this.loadDashboardData}
                        loading={loading}
                        icon={<FileTextOutlined />}
                    >
                        Reîmprospătează
                    </Button>
                </div>

                {/* Real-time Statistics Cards */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Pacienți"
                                value={statistics.totalPatients}
                                prefix={<UserOutlined />}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Din baza de date
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Chestionare Completate"
                                value={statistics.questionnaireStats.total || 0}
                                prefix={<FileTextOutlined />}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Ultima săptămână: {statistics.questionnaireStats.recentWeek || 0}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Pacienți cu Risc"
                                value={statistics.riskPatients}
                                prefix={<WarningOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Risc mediu/înalt
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Alerte Active"
                                value={highPriorityAlerts.length}
                                prefix={<HeartOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Prioritate înaltă
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Risk Distribution */}
                {statistics.questionnaireStats.riskDistribution && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={24}>
                            <Card title="Distribuția Riscurilor">
                                <Row gutter={16}>
                                    {Object.entries(statistics.questionnaireStats.riskDistribution).map(([level, count]) => {
                                        const risk = this.formatRiskLevel(level);
                                        return (
                                            <Col span={6} key={level}>
                                                <Statistic
                                                    title={`Risc ${risk.text}`}
                                                    value={count}
                                                    valueStyle={{ color: risk.color === 'green' ? '#52c41a' :
                                                            risk.color === 'blue' ? '#1890ff' :
                                                                risk.color === 'orange' ? '#fa8c16' : '#f5222d' }}
                                                />
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}

                <Row gutter={16}>
                    {/* Recent Questionnaires with Real Data */}
                    <Col span={12}>
                        <Card
                            title="Chestionare Recente"
                            loading={loading}
                            extra={
                                <div className="text-xs text-gray-500">
                                    Date din baza de date
                                </div>
                            }
                        >
                            {recentQuestionnaires.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentQuestionnaires}
                                    renderItem={item => {
                                        const risk = this.formatRiskLevel(item.riskLevel);
                                        return (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(item.patientId)}
                                                    >
                                                        Vezi Detalii
                                                    </Button>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <div className="flex items-center justify-between">
                                                            <span>{item.patientName}</span>
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-medium`}
                                                                style={{
                                                                    backgroundColor: risk.color === 'green' ? '#f6ffed' :
                                                                        risk.color === 'blue' ? '#e6f7ff' :
                                                                            risk.color === 'orange' ? '#fff7e6' : '#fff2f0',
                                                                    color: risk.color === 'green' ? '#52c41a' :
                                                                        risk.color === 'blue' ? '#1890ff' :
                                                                            risk.color === 'orange' ? '#fa8c16' : '#f5222d'
                                                                }}
                                                            >
                                                                Risc {risk.text}
                                                            </span>
                                                        </div>
                                                    }
                                                    description={
                                                        <div>
                                                            <div>Completat: {new Date(item.submissionDate).toLocaleDateString('ro-RO')}</div>
                                                            <div className="text-xs text-gray-500">ID: {item.id}</div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <FileTextOutlined className="text-4xl mb-2" />
                                    <div>Nu există chestionare recente</div>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* High Priority Alerts from Real Data */}
                    <Col span={12}>
                        <Card
                            title="Alerte Medicale Prioritare"
                            loading={loading}
                            extra={
                                <div className="text-xs text-gray-500">
                                    {highPriorityAlerts.length} alerte active
                                </div>
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {highPriorityAlerts.length > 0 ? (
                                    highPriorityAlerts.slice(0, 5).map((alert, index) => (
                                        <Alert
                                            key={index}
                                            message={
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{alert.patientName}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        alert.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {alert.priority === 'high' ? 'URGENT' : 'IMPORTANT'}
                                                    </span>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="mb-1">{alert.message}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Categorie: {alert.category} • {new Date(alert.date).toLocaleDateString('ro-RO')}
                                                    </div>
                                                </div>
                                            }
                                            type={alert.type === 'danger' ? 'error' : 'warning'}
                                            showIcon
                                            action={
                                                <Button
                                                    size="small"
                                                    onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(alert.patientId)}
                                                >
                                                    Vezi Pacient
                                                </Button>
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <HeartOutlined className="text-4xl mb-2" />
                                        <div>Nu există alerte medicale prioritare</div>
                                        <div className="text-xs mt-2">Toate cazurile sunt stabile</div>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>
                </Row>

                {/* Risk Patients Summary */}
                {riskAlerts.length > 0 && (
                    <Row gutter={16} style={{ marginTop: 24 }}>
                        <Col span={24}>
                            <Card title="Pacienți cu Risc Înalt/Mediu">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {riskAlerts.map((patient, index) => {
                                        const risk = this.formatRiskLevel(patient.riskLevel);
                                        return (
                                            <div
                                                key={index}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(patient.patientId)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-medium text-gray-800">{patient.patientName}</h3>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium`}
                                                        style={{
                                                            backgroundColor: risk.color === 'orange' ? '#fff7e6' : '#fff2f0',
                                                            color: risk.color === 'orange' ? '#fa8c16' : '#f5222d'
                                                        }}
                                                    >
                                                        {risk.text}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    {patient.riskDescription}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Evaluat: {new Date(patient.submissionDate).toLocaleDateString('ro-RO')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {riskAlerts.length === 0 && (
                                    <div className="text-center text-gray-500 py-8">
                                        <UserOutlined className="text-4xl mb-2" />
                                        <div>Nu există pacienți cu risc înalt în acest moment</div>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Database Connection Status */}
                <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card size="small">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Conectat la baza de date PostgreSQL</span>
                                </div>
                                <div className="text-gray-500">
                                    Ultima actualizare: {new Date().toLocaleTimeString('ro-RO')}
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default DoctorDashboard;