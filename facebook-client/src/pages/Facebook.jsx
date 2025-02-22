import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter,  Route, Routes, Navigate, useSearchParams } from "react-router-dom";

const API_BASE = "https://mojo-assessment.onrender.com";

const Login = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Login with Facebook</h1>
            <a href={`${API_BASE}/auth/facebook`}>
                <button style={{ padding: "10px 20px", fontSize: "16px" }}>Login with Facebook</button>
            </a>
        </div>
    );
};

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState("");
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            axios.get(`${API_BASE}/api/user`, { headers: { Authorization: `Bearer ${token}` } }).then(res => setUser(res.data));
            axios.get(`${API_BASE}/api/pages`, { headers: { Authorization: `Bearer ${token}` } }).then(res => setPages(res.data.data));
        }
    }, [token]);

    const fetchInsights = () => {
        const since = "2024-01-01";
        const until = "2024-02-17";
        axios
            .get(`${API_BASE}/api/page-insights?pageId=${selectedPage}&since=${since}&until=${until}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => setInsights(res.data.data));
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {user && (
                <>
                    <h1>Welcome, {user.name}</h1>
                    <img src={user.picture.data.url} alt="profile" />
                </>
            )}

            <h2>Select a Page</h2>
            <select onChange={(e) => setSelectedPage(e.target.value)}>
                <option value="">Select Page</option>
                {pages.map(page => (
                    <option key={page.id} value={page.id}>{page.name}</option>
                ))}
            </select>
            <button onClick={fetchInsights}>Get Insights</button>

            {insights && (
                <div>
                    <h3>Insights</h3>
                    {insights.map(metric => (
                        <p key={metric?.name}>{metric?.name}: {metric?.values[0]?.value}</p>
                    ))}
                </div>
            )}
        </div>
    );
};


const Facebook = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </BrowserRouter>
);

export default Facebook;