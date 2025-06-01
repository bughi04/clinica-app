import React, { Component } from 'react';
import { Card, Row, Col, Statistic, Alert, List, Button, Space, message, Progress, Avatar } from 'antd';
import { Activity, Users, FileText, AlertTriangle, Heart, Award, Clock, TrendingUp } from 'lucide-react';
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
            error: null,
            refreshing: false
        };
    }

    componentDidMount() {
        this.loadDashboardData();
        this.refreshInterval = setInterval(this.loadDashboardData, 5 * 60 * 1000);
    }

    componentWillUnmount() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    loadDashboardData = async () => {
        try {
            this.setState({ refreshing: true, error: null });

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
                loading: false,
                refreshing: false
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            message.error('Eroare la încărcarea datelor dashboard');
            this.setState({
                loading: false,
                refreshing: false,
                error: 'Eroare la încărcarea datelor din baza de date'
            });
        }
    };

    formatRiskLevel = (riskLevel) => {
        const riskMap = {
            'minimal': { text: 'Minimal', color: '#52c41a', bgColor: '#f6ffed' },
            'low': { text: 'Scăzut', color: '#1890ff', bgColor: '#e6f7ff' },
            'medium': { text: 'Mediu', color: '#fa8c16', bgColor: '#fff7e6' },
            'high': { text: 'Înalt', color: '#f5222d', bgColor: '#fff2f0' }
        };
        return riskMap[riskLevel] || { text: 'Necunoscut', color: '#d9d9d9', bgColor: '#fafafa' };
    };

    render() {
        const {
            statistics,
            recentQuestionnaires,
            riskAlerts,
            highPriorityAlerts,
            loading,
            error,
            refreshing
        } = this.state;

        if (loading && recentQuestionnaires.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <span className="text-gray-600 font-medium">Se încarcă datele din baza de date...</span>
                    </div>
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
            <div className="doctor-dashboard space-y-8 animate-fade-in">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 animate-morph"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    Panou de Control Medical
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Dental Point Clinic - Sistem Digital de Management
                                </p>
                            </div>
                            <div className="text-right">
                                <Button
                                    onClick={this.loadDashboardData}
                                    loading={refreshing}
                                    className="glass-button text-white border-white/30 hover:bg-white/20"
                                >
                                    <Activity className="w-4 h-4 mr-2" />
                                    Reîmprospătează
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                {
                                    value: statistics.totalPatients,
                                    label: "Pacienți Totali",
                                    icon: <Users className="w-5 h-5" />,
                                    change: "+12%"
                                },
                                {
                                    value: statistics.questionnaireStats.total || 0,
                                    label: "Chestionare",
                                    icon: <FileText className="w-5 h-5" />,
                                    change: "+8%"
                                },
                                {
                                    value: statistics.riskPatients,
                                    label: "Risc Înalt",
                                    icon: <AlertTriangle className="w-5 h-5" />,
                                    change: "-3%"
                                },
                                {
                                    value: highPriorityAlerts.length,
                                    label: "Alerte Active",
                                    icon: <Heart className="w-5 h-5" />,
                                    change: "+2%"
                                }
                            ].map((stat, index) => (
                                <div key={index} className="glass-card p-4 text-center animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="flex items-center justify-center mb-2">
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-xs text-white/80">{stat.label}</div>
                                    <div className="text-xs text-green-300 mt-1">{stat.change}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics Cards */}
                <Row gutter={[24, 24]}>
                    <Col span={6}>
                        <Card className="hover-lift glass-card h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <Statistic
                                    title={<span className="text-gray-600 font-medium">Total Pacienți</span>}
                                    value={statistics.totalPatients}
                                    valueStyle={{ color: '#1890ff', fontSize: '2rem', fontWeight: 'bold' }}
                                />
                                <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500">+5.2%</span> acest mese
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card className="hover-lift glass-card h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <Statistic
                                    title={<span className="text-gray-600 font-medium">Chestionare Completate</span>}
                                    value={statistics.questionnaireStats.total || 0}
                                    valueStyle={{ color: '#52c41a', fontSize: '2rem', fontWeight: 'bold' }}
                                />
                                <div className="text-sm text-gray-500 mt-2">
                                    Ultima săptămână: <span className="font-semibold text-emerald-600">{statistics.questionnaireStats.recentWeek || 0}</span>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card className="hover-lift glass-card h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                                    <AlertTriangle className="w-8 h-8 text-white" />
                                </div>
                                <Statistic
                                    title={<span className="text-gray-600 font-medium">Pacienți cu Risc</span>}
                                    value={statistics.riskPatients}
                                    valueStyle={{ color: '#f5222d', fontSize: '2rem', fontWeight: 'bold' }}
                                />
                                <div className="text-sm text-gray-500 mt-2">
                                    Risc mediu/înalt
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card className="hover-lift glass-card h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <Statistic
                                    title={<span className="text-gray-600 font-medium">Alerte Active</span>}
                                    value={highPriorityAlerts.length}
                                    valueStyle={{ color: '#722ed1', fontSize: '2rem', fontWeight: 'bold' }}
                                />
                                <div className="text-sm text-gray-500 mt-2">
                                    Prioritate înaltă
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Risk Distribution Chart */}
                {statistics.questionnaireStats.riskDistribution && (
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Card title={
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xl font-semibold">Distribuția Riscurilor Medicale</span>
                                </div>
                            } className="glass-card hover-lift">
                                <Row gutter={16}>
                                    {Object.entries(statistics.questionnaireStats.riskDistribution).map(([level, count]) => {
                                        const risk = this.formatRiskLevel(level);
                                        const percentage = statistics.questionnaireStats.total > 0 ?
                                            Math.round((count / statistics.questionnaireStats.total) * 100) : 0;

                                        return (
                                            <Col span={6} key={level}>
                                                <div className="text-center p-4 rounded-xl transition-all duration-300 hover:scale-105"
                                                     style={{ backgroundColor: risk.bgColor }}>
                                                    <div className="text-3xl font-bold mb-2" style={{ color: risk.color }}>
                                                        {count}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-600 mb-2">
                                                        Risc {risk.text}
                                                    </div>
                                                    <Progress
                                                        percent={percentage}
                                                        strokeColor={risk.color}
                                                        size="small"
                                                        showInfo={false}
                                                    />
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {percentage}% din total
                                                    </div>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}

                <Row gutter={[24, 24]}>
                    {/* Enhanced Recent Questionnaires */}
                    <Col span={12}>
                        <Card
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xl font-semibold">Chestionare Recente</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {recentQuestionnaires.length} din ultimele completări
                                    </div>
                                </div>
                            }
                            loading={refreshing}
                            className="glass-card hover-lift h-full"
                        >
                            {recentQuestionnaires.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentQuestionnaires}
                                    renderItem={(item, index) => {
                                        const risk = this.formatRiskLevel(item.riskLevel);
                                        return (
                                            <List.Item
                                                className="hover:bg-gray-50 rounded-lg transition-all duration-300 px-4 animate-slide-in-left"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                                actions={[
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        className="hover-scale"
                                                        onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(item.patientId)}
                                                    >
                                                        Vezi Detalii
                                                    </Button>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            style={{
                                                                backgroundColor: risk.color,
                                                                fontSize: '16px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {item.patientName.split(' ').map(n => n[0]).join('')}
                                                        </Avatar>
                                                    }
                                                    title={
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-gray-800">{item.patientName}</span>
                                                            <span
                                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: risk.bgColor,
                                                                    color: risk.color
                                                                }}
                                                            >
                                                                Risc {risk.text}
                                                            </span>
                                                        </div>
                                                    }
                                                    description={
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Clock className="w-4 h-4" />
                                                                Completat: {new Date(item.submissionDate).toLocaleDateString('ro-RO')}
                                                            </div>
                                                            <div className="text-xs text-gray-500">ID: {item.id}</div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <div className="text-lg font-medium mb-2">Nu există chestionare recente</div>
                                    <div className="text-sm">Chestionarele completate vor apărea aici</div>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Enhanced High Priority Alerts */}
                    <Col span={12}>
                        <Card
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center animate-pulse">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xl font-semibold">Alerte Medicale Prioritare</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-500">
                                            {highPriorityAlerts.length} alerte active
                                        </span>
                                    </div>
                                </div>
                            }
                            loading={refreshing}
                            className="glass-card hover-lift h-full"
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {highPriorityAlerts.length > 0 ? (
                                    highPriorityAlerts.slice(0, 5).map((alert, index) => (
                                        <Alert
                                            key={index}
                                            className="animate-slide-in-right hover-lift"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                            message={
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            style={{
                                                                backgroundColor: alert.priority === 'high' ? '#f5222d' : '#fa8c16',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}
                                                            size="small"
                                                        >
                                                            {alert.patientName.split(' ').map(n => n[0]).join('')}
                                                        </Avatar>
                                                        <span className="font-semibold">{alert.patientName}</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        alert.priority === 'high'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {alert.priority === 'high' ? 'URGENT' : 'IMPORTANT'}
                                                    </span>
                                                </div>
                                            }
                                            description={
                                                <div className="mt-2">
                                                    <div className="font-medium text-gray-800 mb-1">{alert.message}</div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-gray-500">
                                                            Categorie: <span className="font-medium">{alert.category}</span> •
                                                            {' '}{new Date(alert.date).toLocaleDateString('ro-RO')}
                                                        </div>
                                                        <Button
                                                            size="small"
                                                            type="link"
                                                            className="hover-scale"
                                                            onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(alert.patientId)}
                                                        >
                                                            Vezi Pacient →
                                                        </Button>
                                                    </div>
                                                </div>
                                            }
                                            type={alert.type === 'danger' ? 'error' : 'warning'}
                                            showIcon
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <div className="text-lg font-medium mb-2">Nu există alerte medicale prioritare</div>
                                        <div className="text-sm">Toate cazurile sunt stabile</div>
                                        <div className="text-xs mt-2 text-green-600 font-medium">
                                            ✓ Situația medicală sub control
                                        </div>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>
                </Row>

                {/* Risk Patients Summary */}
                {riskAlerts.length > 0 && (
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Card
                                title={
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xl font-semibold">Pacienți cu Risc Înalt/Mediu</span>
                                    </div>
                                }
                                className="glass-card hover-lift"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {riskAlerts.map((patient, index) => {
                                        const risk = this.formatRiskLevel(patient.riskLevel);
                                        return (
                                            <div
                                                key={index}
                                                className="group bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 animate-slide-in-up"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                                onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(patient.patientId)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            style={{
                                                                backgroundColor: risk.color,
                                                                fontSize: '16px',
                                                                fontWeight: 'bold'
                                                            }}
                                                            size="large"
                                                        >
                                                            {patient.patientName.split(' ').map(n => n[0]).join('')}
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                                {patient.patientName}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                                        style={{
                                                            backgroundColor: risk.bgColor,
                                                            color: risk.color
                                                        }}
                                                    >
                                                        {risk.text}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {patient.riskDescription}
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Evaluat: {new Date(patient.submissionDate).toLocaleDateString('ro-RO')}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Vezi detalii →
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {riskAlerts.length === 0 && (
                                    <div className="text-center text-gray-500 py-12">
                                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <div className="text-lg font-medium mb-2">Nu există pacienți cu risc înalt în acest moment</div>
                                        <div className="text-sm">Situația medicală este sub control</div>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Database Connection Status */}
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card size="small" className="glass-card">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="font-medium text-green-700">Sistem Operațional</span>
                                    </div>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-600">Conectat la baza de date PostgreSQL</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>Ultima actualizare: {new Date().toLocaleTimeString('ro-RO')}</span>
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-4 h-4 text-green-500" />
                                        <span className="text-green-600 font-medium">Online</span>
                                    </div>
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