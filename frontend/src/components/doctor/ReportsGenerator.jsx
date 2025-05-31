import React, { Component } from 'react';
import { Card, Form, Select, DatePicker, Button, Space, Table, message, Row, Col, Statistic, Progress, Divider } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, BarChartOutlined, PieChartOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

class ReportsGenerator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportType: 'patient-summary',
            dateRange: null,
            filters: {},
            reportData: [],
            reportStatistics: {},
            loading: false,
            generateLoading: false
        };
    }

    reportTypes = [
        { value: 'patient-summary', label: 'Rezumat Pacienți' },
        { value: 'risk-analysis', label: 'Analiza Riscurilor' },
        { value: 'allergy-report', label: 'Raport Alergii' },
        { value: 'medical-conditions', label: 'Condiții Medicale' },
        { value: 'consent-audit', label: 'Audit Acorduri' },
        { value: 'demographic-analysis', label: 'Analiză Demografică' }
    ];

    handleReportTypeChange = (value) => {
        this.setState({ reportType: value, reportData: [], reportStatistics: {} });
    };

    generateReport = async () => {
        const { reportType } = this.state;

        this.setState({ generateLoading: true });

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock data based on report type
            let mockData = [];
            let mockStatistics = {};

            switch (reportType) {
                case 'patient-summary':
                    mockData = [
                        {
                            patientName: 'Maria Popescu',
                            email: 'maria.popescu@email.com',
                            submissionDate: new Date().toISOString(),
                            riskLevel: 'Mediu',
                            consentGiven: true
                        },
                        {
                            patientName: 'Ion Ionescu',
                            email: 'ion.ionescu@email.com',
                            submissionDate: new Date(Date.now() - 86400000).toISOString(),
                            riskLevel: 'Înalt',
                            consentGiven: true
                        },
                        {
                            patientName: 'Ana Testescu',
                            email: 'ana.test@email.com',
                            submissionDate: new Date(Date.now() - 172800000).toISOString(),
                            riskLevel: 'Minimal',
                            consentGiven: true
                        }
                    ];
                    mockStatistics = {
                        totalRecords: 3,
                        highRiskCount: 1,
                        consentCompliance: 100,
                        averageRiskScore: 6.5
                    };
                    break;

                case 'risk-analysis':
                    mockData = [
                        {
                            patientName: 'Ion Ionescu',
                            riskFactors: ['Diabet tip 2', 'Probleme cardiace', 'Fumător'],
                            riskScore: 8,
                            recommendations: 'Consultație cardiologică înainte de anestezie'
                        },
                        {
                            patientName: 'Maria Popescu',
                            riskFactors: ['Alergii multiple', 'Hipertensiune'],
                            riskScore: 6,
                            recommendations: 'Test alergic înainte de administrarea medicamentelor'
                        }
                    ];
                    mockStatistics = {
                        totalRecords: 2,
                        highRiskCount: 1,
                        averageRiskScore: 7.0
                    };
                    break;

                case 'allergy-report':
                    mockData = [
                        {
                            patientName: 'Maria Popescu',
                            allergies: 'Penicilină, Polen',
                            severity: 'Moderată',
                            reportDate: new Date().toISOString()
                        },
                        {
                            patientName: 'Gheorghe Vlad',
                            allergies: 'Latex',
                            severity: 'Ușoară',
                            reportDate: new Date(Date.now() - 259200000).toISOString()
                        }
                    ];
                    mockStatistics = {
                        totalRecords: 2,
                        topAllergies: [
                            { name: 'Penicilină', count: 12 },
                            { name: 'Latex', count: 8 },
                            { name: 'Polen', count: 6 },
                            { name: 'Ibuprofen', count: 4 },
                            { name: 'Novocaină', count: 3 }
                        ]
                    };
                    break;

                case 'medical-conditions':
                    mockData = [
                        {
                            patientName: 'Ion Ionescu',
                            conditions: 'Diabet tip 2',
                            currentMedication: 'Metformin 500mg, Insulină',
                            lastUpdate: new Date(Date.now() - 86400000).toISOString()
                        },
                        {
                            patientName: 'Maria Popescu',
                            conditions: 'Hipertensiune arterială',
                            currentMedication: 'Enalapril 10mg',
                            lastUpdate: new Date().toISOString()
                        }
                    ];
                    mockStatistics = {
                        totalRecords: 2,
                        monthlyTrends: { growth: 15 }
                    };
                    break;

                case 'consent-audit':
                    mockData = [
                        {
                            patientName: 'Maria Popescu',
                            consentType: 'GDPR + General',
                            status: 'Activ',
                            signedDate: new Date().toISOString(),
                            expiryDate: new Date(Date.now() + 31536000000).toISOString() // 1 year
                        },
                        {
                            patientName: 'Ion Ionescu',
                            consentType: 'GDPR + Endodontic',
                            status: 'Activ',
                            signedDate: new Date(Date.now() - 86400000).toISOString(),
                            expiryDate: new Date(Date.now() + 31449600000).toISOString()
                        }
                    ];
                    mockStatistics = {
                        totalRecords: 2,
                        consentCompliance: 100
                    };
                    break;

                case 'demographic-analysis':
                    mockData = [
                        { ageGroup: '18-30', patientCount: 45, gender: 'Mixt', percentage: 28.8 },
                        { ageGroup: '31-45', patientCount: 62, gender: 'Mixt', percentage: 39.7 },
                        { ageGroup: '46-60', patientCount: 35, gender: 'Mixt', percentage: 22.4 },
                        { ageGroup: '60+', patientCount: 14, gender: 'Mixt', percentage: 9.0 }
                    ];
                    mockStatistics = {
                        totalRecords: 156,
                        monthlyTrends: { growth: 8 }
                    };
                    break;

                default:
                    mockData = [];
                    mockStatistics = {};
            }

            this.setState({
                reportData: mockData,
                reportStatistics: mockStatistics,
                generateLoading: false
            });
            message.success('Raportul a fost generat cu succes!');
        } catch (error) {
            console.error('Error generating report:', error);
            message.error('Eroare la generarea raportului');
            this.setState({ generateLoading: false });
        }
    };

    exportToPDF = async () => {
        const { reportType } = this.state;

        try {
            // Simulate PDF export
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create a simple text file as demo
            const content = `RAPORT DENTAL POINT CLINIC\n\nTip: ${this.reportTypes.find(t => t.value === reportType)?.label}\nData generării: ${new Date().toLocaleString('ro-RO')}\n\nAcesta este un export demo.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `raport_${reportType}_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('Raportul demo a fost descărcat!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            message.error('Eroare la exportul PDF');
        }
    };

    exportToExcel = async () => {
        const { reportType } = this.state;

        try {
            // Simulate Excel export
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create CSV content as demo
            const headers = this.getReportColumns().map(col => col.title).join(',');
            const rows = this.state.reportData.map(row =>
                this.getReportColumns().map(col => {
                    const value = row[col.dataIndex] || '';
                    return typeof value === 'string' ? `"${value}"` : value;
                }).join(',')
            ).join('\n');

            const csvContent = `${headers}\n${rows}`;
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `raport_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('Raportul CSV a fost descărcat!');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            message.error('Eroare la exportul Excel');
        }
    };

    getReportColumns = () => {
        const { reportType } = this.state;

        switch (reportType) {
            case 'patient-summary':
                return [
                    {
                        title: 'Nume Pacient',
                        dataIndex: 'patientName',
                        key: 'patientName',
                        sorter: (a, b) => a.patientName.localeCompare(b.patientName),
                    },
                    {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email'
                    },
                    {
                        title: 'Data Completării',
                        dataIndex: 'submissionDate',
                        key: 'submissionDate',
                        render: (date) => new Date(date).toLocaleDateString('ro-RO'),
                        sorter: (a, b) => new Date(a.submissionDate) - new Date(b.submissionDate),
                    },
                    {
                        title: 'Nivel Risc',
                        dataIndex: 'riskLevel',
                        key: 'riskLevel',
                        render: (level) => {
                            const colors = {
                                'Minimal': 'green',
                                'Scăzut': 'yellow',
                                'Mediu': 'orange',
                                'Înalt': 'red'
                            };
                            return <span style={{ color: colors[level] || 'black' }}>{level}</span>;
                        }
                    },
                    {
                        title: 'Acord Semnat',
                        dataIndex: 'consentGiven',
                        key: 'consentGiven',
                        render: (val) => val ? '✅ Da' : '❌ Nu'
                    }
                ];

            case 'risk-analysis':
                return [
                    { title: 'Pacient', dataIndex: 'patientName', key: 'patientName' },
                    {
                        title: 'Factori de Risc',
                        dataIndex: 'riskFactors',
                        key: 'riskFactors',
                        render: (factors) => Array.isArray(factors) ? factors.join(', ') : factors
                    },
                    {
                        title: 'Scor Risc',
                        dataIndex: 'riskScore',
                        key: 'riskScore',
                        sorter: (a, b) => a.riskScore - b.riskScore,
                        render: (score) => `${score}/10`
                    },
                    { title: 'Recomandări', dataIndex: 'recommendations', key: 'recommendations' }
                ];

            case 'allergy-report':
                return [
                    { title: 'Pacient', dataIndex: 'patientName', key: 'patientName' },
                    {
                        title: 'Alergii',
                        dataIndex: 'allergies',
                        key: 'allergies'
                    },
                    {
                        title: 'Severitate',
                        dataIndex: 'severity',
                        key: 'severity',
                        render: (severity) => {
                            const colors = { 'Ușoară': 'green', 'Moderată': 'orange', 'Severă': 'red' };
                            return <span style={{ color: colors[severity] }}>{severity}</span>;
                        }
                    },
                    {
                        title: 'Data Raportării',
                        dataIndex: 'reportDate',
                        key: 'reportDate',
                        render: (date) => new Date(date).toLocaleDateString('ro-RO')
                    }
                ];

            case 'medical-conditions':
                return [
                    { title: 'Pacient', dataIndex: 'patientName', key: 'patientName' },
                    {
                        title: 'Condiții Medicale',
                        dataIndex: 'conditions',
                        key: 'conditions'
                    },
                    {
                        title: 'Medicație Curentă',
                        dataIndex: 'currentMedication',
                        key: 'currentMedication'
                    },
                    {
                        title: 'Data Actualizării',
                        dataIndex: 'lastUpdate',
                        key: 'lastUpdate',
                        render: (date) => new Date(date).toLocaleDateString('ro-RO')
                    }
                ];

            case 'consent-audit':
                return [
                    { title: 'Pacient', dataIndex: 'patientName', key: 'patientName' },
                    {
                        title: 'Tip Acord',
                        dataIndex: 'consentType',
                        key: 'consentType'
                    },
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                            const colors = { 'Activ': 'green', 'Expirat': 'red', 'Revocat': 'orange' };
                            return <span style={{ color: colors[status] }}>{status}</span>;
                        }
                    },
                    {
                        title: 'Data Semnării',
                        dataIndex: 'signedDate',
                        key: 'signedDate',
                        render: (date) => new Date(date).toLocaleDateString('ro-RO')
                    },
                    {
                        title: 'Data Expirării',
                        dataIndex: 'expiryDate',
                        key: 'expiryDate',
                        render: (date) => date ? new Date(date).toLocaleDateString('ro-RO') : 'N/A'
                    }
                ];

            case 'demographic-analysis':
                return [
                    { title: 'Grupa de Vârstă', dataIndex: 'ageGroup', key: 'ageGroup' },
                    { title: 'Numărul de Pacienți', dataIndex: 'patientCount', key: 'patientCount' },
                    { title: 'Gen', dataIndex: 'gender', key: 'gender' },
                    {
                        title: 'Procent din Total',
                        dataIndex: 'percentage',
                        key: 'percentage',
                        render: (percentage) => `${percentage}%`
                    }
                ];

            default:
                return [];
        }
    };

    renderStatistics = () => {
        const { reportStatistics } = this.state;

        if (!reportStatistics || Object.keys(reportStatistics).length === 0) {
            return null;
        }

        return (
            <Card title="Statistici Raport" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic
                            title="Total Înregistrări"
                            value={reportStatistics.totalRecords || 0}
                            prefix={<BarChartOutlined />}
                        />
                    </Col>

                    {reportStatistics.highRiskCount !== undefined && (
                        <Col span={6}>
                            <Statistic
                                title="Pacienți Risc Înalt"
                                value={reportStatistics.highRiskCount}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<PieChartOutlined />}
                            />
                        </Col>
                    )}

                    {reportStatistics.consentCompliance !== undefined && (
                        <Col span={6}>
                            <div>
                                <div style={{ marginBottom: 8 }}>Conformitate Acorduri</div>
                                <Progress
                                    percent={reportStatistics.consentCompliance}
                                    status={reportStatistics.consentCompliance >= 95 ? 'success' : 'normal'}
                                />
                            </div>
                        </Col>
                    )}

                    {reportStatistics.averageRiskScore !== undefined && (
                        <Col span={6}>
                            <Statistic
                                title="Scor Mediu de Risc"
                                value={reportStatistics.averageRiskScore}
                                precision={1}
                                suffix="/ 10"
                            />
                        </Col>
                    )}
                </Row>

                {reportStatistics.topAllergies && (
                    <div style={{ marginTop: 16 }}>
                        <Divider orientation="left">Top 5 Alergii Raportate</Divider>
                        <Row gutter={8}>
                            {reportStatistics.topAllergies.slice(0, 5).map((allergy, index) => (
                                <Col span={4} key={index}>
                                    <Card size="small">
                                        <Statistic
                                            title={allergy.name}
                                            value={allergy.count}
                                            suffix="pacienți"
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {reportStatistics.monthlyTrends && (
                    <div style={{ marginTop: 16 }}>
                        <Divider orientation="left">Tendințe Lunare</Divider>
                        <div style={{ fontSize: 14 }}>
                            Creștere față de luna anterioară: {' '}
                            <span style={{
                                color: reportStatistics.monthlyTrends.growth >= 0 ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                {reportStatistics.monthlyTrends.growth >= 0 ? '+' : ''}{reportStatistics.monthlyTrends.growth}%
              </span>
                        </div>
                    </div>
                )}
            </Card>
        );
    };

    render() {
        const { reportType, dateRange, reportData, generateLoading } = this.state;

        return (
            <div className="reports-generator">
                <Card title="Generator Rapoarte - Dental Point Clinic">
                    <Form layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Tip Raport">
                                    <Select
                                        value={reportType}
                                        onChange={this.handleReportTypeChange}
                                        style={{ width: '100%' }}
                                        size="large"
                                    >
                                        {this.reportTypes.map(type => (
                                            <Option key={type.value} value={type.value}>
                                                {type.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Perioada">
                                    <RangePicker
                                        value={dateRange}
                                        onChange={(dates) => this.setState({ dateRange: dates })}
                                        style={{ width: '100%' }}
                                        size="large"
                                        placeholder={['Data început', 'Data sfârșit']}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Space size="large">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={this.generateReport}
                                    loading={generateLoading}
                                    icon={<BarChartOutlined />}
                                >
                                    Generează Raport
                                </Button>

                                {reportData.length > 0 && (
                                    <>
                                        <Button
                                            size="large"
                                            icon={<FilePdfOutlined />}
                                            onClick={this.exportToPDF}
                                        >
                                            Export Demo TXT
                                        </Button>

                                        <Button
                                            size="large"
                                            icon={<FileExcelOutlined />}
                                            onClick={this.exportToExcel}
                                        >
                                            Export CSV
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>

                {this.renderStatistics()}

                {reportData.length > 0 && (
                    <Card
                        title={`Rezultate Raport - ${this.reportTypes.find(t => t.value === reportType)?.label}`}
                        style={{ marginTop: 16 }}
                    >
                        <Table
                            columns={this.getReportColumns()}
                            dataSource={reportData}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} din ${total} înregistrări`,
                            }}
                            size="small"
                            scroll={{ x: 'max-content' }}
                            rowKey={(record, index) => record.id || index}
                        />
                    </Card>
                )}

                {reportData.length === 0 && !generateLoading && (
                    <Card style={{ marginTop: 16, textAlign: 'center', color: '#666' }}>
                        <p>Selectați tipul de raport și perioada, apoi apăsați "Generează Raport" pentru a vedea rezultatele.</p>
                    </Card>
                )}
            </div>
        );
    }
}

export default ReportsGenerator;