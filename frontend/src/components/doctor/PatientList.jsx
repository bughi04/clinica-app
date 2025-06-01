import React, { Component } from 'react';
import { Table, Input, Button, Space, Tag, Select, DatePicker } from 'antd';
import { SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import ApiService from "../../services/apiService.js";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

class PatientList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            patients: [],
            filteredPatients: [],
            loading: true,
            searchText: '',
            filters: {
                hasAllergies: null,
                hasChronicConditions: null,
                dateRange: null
            },
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            }
        };
    }

    componentDidMount() {
        this.loadPatients();
    }

    loadPatients = async (page = 1, pageSize = 10) => {
        this.setState({ loading: true });

        try {
            // Fetch patient data using the ApiServiceAdd commentMore actions
            const patientData = await ApiService.getFormattedPatientList(page, pageSize);

            const { patients, totalItems } = patientData;

            // Update state with fetched data
            this.setState({
                patients: patients,
                filteredPatients: patients, // Initially show all patients
                pagination: {
                    ...this.state.pagination,
                    total: totalItems,
                    current: page,
                    pageSize: pageSize,
                },
                loading: false,
            });
        } catch (error) {
            console.error('Error loading patients:', error);
            this.setState({ loading: false });
        }
    };

    handleSearch = (value) => {
        this.setState({ searchText: value });
        this.applyFilters({ searchText: value });
    };

    handleFilterChange = (filterType, value) => {
        const newFilters = {
            ...this.state.filters,
            [filterType]: value
        };
        this.setState({ filters: newFilters });
        this.applyFilters({ filters: newFilters });
    };

    applyFilters = ({ searchText = this.state.searchText, filters = this.state.filters } = {}) => {
        let filtered = [...this.state.patients];

        // Text search
        if (searchText) {
            filtered = filtered.filter(patient =>
                patient.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Apply filters
        if (filters.hasAllergies !== null) {
            filtered = filtered.filter(patient =>
                filters.hasAllergies ? patient.allergies.length > 0 : patient.allergies.length === 0
            );
        }

        if (filters.hasChronicConditions !== null) {
            filtered = filtered.filter(patient =>
                filters.hasChronicConditions ? patient.medicalConditions.length > 0 : patient.medicalConditions.length === 0
            );
        }

        if (filters.dateRange) {
            const [startDate, endDate] = filters.dateRange;
            filtered = filtered.filter(patient => {
                const submissionDate = new Date(patient.lastQuestionnaireDate);
                return submissionDate >= startDate && submissionDate <= endDate;
            });
        }

        this.setState({ filteredPatients: filtered });
    };

    getRiskLevel = (patient) => {
        let riskCount = 0;
        if (patient.allergies?.length > 0) riskCount++;
        if (patient.medicalConditions?.length > 0) riskCount++;
        if (patient.heartIssues) riskCount++;
        if (patient.anestheticReactions) riskCount++;

        if (riskCount >= 3) return { level: 'Înalt', color: 'red' };
        if (riskCount >= 2) return { level: 'Mediu', color: 'orange' };
        if (riskCount >= 1) return { level: 'Scăzut', color: 'yellow' };
        return { level: 'Minimal', color: 'green' };
    };

    columns = [
        {
            title: 'Nume Complet',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Nivel Risc',
            key: 'riskLevel',
            render: (_, record) => {
                const risk = this.getRiskLevel(record);
                return <Tag color={risk.color}>{risk.level}</Tag>;
            },
        },
        {
            title: 'Ultima Completare',
            dataIndex: 'lastQuestionnaireDate',
            key: 'lastQuestionnaireDate',
            render: (date) => date ? new Date(date).toLocaleDateString('ro-RO') : 'N/A',
            sorter: (a, b) => new Date(a.lastQuestionnaireDate) - new Date(b.lastQuestionnaireDate),
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => this.props.onPatientSelect && this.props.onPatientSelect(record.patientId)}
                    >
                        Vezi Profil
                    </Button>
                </Space>
            ),
        },
    ];

    render() {
        const { filteredPatients, loading, pagination } = this.state;

        return (
            <div className="patient-list">
                <div style={{ marginBottom: 16 }}>
                    <Space size="middle" wrap>
                        <Search
                            placeholder="Caută pacient după nume sau email"
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={this.handleSearch}
                            style={{ width: 300 }}
                        />

                        <Select
                            placeholder="Alergii"
                            allowClear
                            style={{ width: 120 }}
                            onChange={(value) => this.handleFilterChange('hasAllergies', value)}
                        >
                            <Option value={true}>Cu alergii</Option>
                            <Option value={false}>Fără alergii</Option>
                        </Select>

                        <Select
                            placeholder="Condiții cronice"
                            allowClear
                            style={{ width: 150 }}
                            onChange={(value) => this.handleFilterChange('hasChronicConditions', value)}
                        >
                            <Option value={true}>Cu condiții</Option>
                            <Option value={false}>Fără condiții</Option>
                        </Select>

                        <RangePicker
                            placeholder={['De la', 'Până la']}
                            onChange={(dates) => this.handleFilterChange('dateRange', dates)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </div>

                <Table
                    columns={this.columns}
                    dataSource={filteredPatients}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} din ${total} pacienți`,
                        onChange: this.loadPatients,
                        onShowSizeChange: this.loadPatients
                    }}
                    rowKey="patientId"
                    size="middle"
                />
            </div>
        );
    }
}

export default PatientList;