import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CounterContext } from '../../Context/Context.js';

const Agent = () => {
    const { user } = useContext(CounterContext);
    const [agents, setAgents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('nameAsc');

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await axios.get('/api/User/GetAllUsers');
                setAgents(response.data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };

        fetchAgents();
    }, []);

    // Handle sorting change
    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    // Sort agents based on selected sort order
    const sortedAgents = [...agents].sort((a, b) => {
        switch (sortOrder) {
            case 'nameAsc':
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            case 'nameDesc':
                return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
            case 'newOld':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldNew':
                return new Date(a.createdAt) - new Date(b.createdAt);
            default:
                return 0;
        }
    });

    const filteredAgents = sortedAgents.filter((agent) => {
        const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
        return (
            agent.userID != ((user && user.UserId) || 0) &&
            (agent.userRole === 'Admin' || agent.userRole === 'Agent' || agent.userRole === 'Seller') &&
            fullName.includes(searchQuery.toLowerCase())
        );
    });

    return (
        <>
            <div className="main m-3">
                <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginBottom: '20px' }}
                >
                    <h1>Agents</h1>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search agents by name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                </div>

                <div className="card card-body mb-3 pb-2">
                    <div className="d-flex justify-content-start align-items-center">
                        <div className="me-3">
                            <label className="fw-bold fs-4">Sort By:</label>
                        </div>
                        <div>
                            <select
                                className="form-select"
                                value={sortOrder}
                                onChange={handleSortChange}
                            >
                                <option value="nameAsc">Sort by Name (A-Z)</option>
                                <option value="nameDesc">Sort by Name (Z-A)</option>
                                <option value="newOld">Sort by Newest</option>
                                <option value="oldNew">Sort by Oldest</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <div
                        className="container"
                        style={{
                            backgroundColor: '#f7f7f7',
                        }}
                    >
                        <div className="row agentbody">
                            {filteredAgents.filter(agent => agent.userRole == 'Agent').map((agent) => (
                                <div key={agent.userID} className="col-md-3 col-sm-6 mb-4">
                                    <div className="text-decoration-none">
                                        <div
                                            className="card agent-card h-100"
                                            style={{
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                            }}
                                        >
                                            {/* Agent Image */}
                                            <img
                                                src={agent.profilePhoto || 'https://placehold.jp/150x150.png'}
                                                alt={agent.firstName}
                                                className="card-img-top agent-img"
                                                style={{
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                    borderTopLeftRadius: '10px',
                                                    borderTopRightRadius: '10px',
                                                }}
                                            />

                                            {/* Card Body */}
                                            <div className="card-body text-center">
                                                <h5 className="card-title mb-1" style={{ fontSize: '1.25rem', color: '#333' }}>
                                                    {agent.firstName} {agent.lastName}
                                                </h5>
                                                <p className="card-text text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                                                    {agent.userRole}
                                                </p>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <a
                                                        href="#"
                                                        className="btn btn-outline-primary btn-sm"
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-1">
                                                            <i className="bi bi-envelope" style={{fontSize:"12px"}}></i>
                                                            <span>Contact</span>
                                                        </div>
                                                    </a>
                                                    <Link
                                                        to={'/Agent/' + agent.userID}
                                                        href="#"
                                                        className="btn btn-outline-secondary btn-sm"
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-1">
                                                            <i className="bi bi-info-circle" style={{fontSize:"12px"}}></i>
                                                            <span>Details</span>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div
                                                className="card-footer bg-light text-center"
                                                style={{ borderTop: '1px solid #e0e0e0' }}
                                            >
                                                <small className="text-muted">
                                                    <i className="bi bi-star-fill text-warning"></i> 4.5 (25 Reviews)
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredAgents.length === 0 && (
                                <p>No agents found matching your search criteria.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Agent;
