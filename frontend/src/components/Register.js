import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        dob: '',
        role: 'KUNDE',
        //carClass: 'MEDIUM',
        base64Image: '',

    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = function () {
            const result = reader.result;
            if (typeof result === 'string') {
                const base64String = result.split(',')[1];
                setFormData((prev) => ({
                    ...prev,
                    base64Image: base64String
                }));
            }
        };
        reader.readAsDataURL(file);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await AuthService.register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registrierung fehlgeschlagen');
        }
    };

    return (
        <div>
            <h2>Registrieren</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nutzername:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Passwort:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Vorname:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Nachname:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Geb. Datum:</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Rolle:</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="KUNDE">Kunde</option>
                        <option value="FAHRER">Fahrer</option>
                    </select>
                </div>



                <div>
                    <label>Profilbild (optional):</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>

                <button type="submit">Registrieren</button>
            </form>

            <p>
                Account vorhanden? <button onClick={() => navigate('/login')}>Login</button>
            </p>
        </div>
    );
};

export default Register;
