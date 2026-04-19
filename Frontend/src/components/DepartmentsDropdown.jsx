import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DepartmentsDropdown.css';

const departments = [
    'Grocery & Essentials',
    'Electronics',
    'Home & Garden',
    'Clothing & Apparel',
    'Sports & Outdoors',
    'Toys & Games',
    'Health & Wellness',
    'Baby & Toddler',
    'Automotive',
    'Beauty & Personal Care'
];

const DepartmentsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleDepartmentClick = (dept) => {
        setIsOpen(false);
        navigate(`/department/${encodeURIComponent(dept)}`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="departments-container" ref={dropdownRef}>
            <div className={`departments-trigger ${isOpen ? 'active' : ''}`} onClick={toggleDropdown}>
                <span>Departments</span>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </div>

            {isOpen && (
                <div className="departments-menu">
                    <ul className="departments-list">
                        {departments.map((dept) => (
                            <li 
                                key={dept} 
                                className="department-item"
                                onClick={() => handleDepartmentClick(dept)}
                            >
                                {dept}
                                <i className="fa-solid fa-chevron-right"></i>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DepartmentsDropdown;
