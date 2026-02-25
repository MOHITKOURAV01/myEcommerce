import React from 'react';
import './FilterBar.css';

function FilterBar({ filters, setFilters }) {
    const handleLanguageChange = (e) => {
        setFilters({ ...filters, language: e.target.value });
    };

    const handleMoodChange = (e) => {
        setFilters({ ...filters, mood: e.target.value });
    };

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <label>Language:</label>
                <select value={filters.language} onChange={handleLanguageChange}>
                    <option value="">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Mood:</label>
                <select value={filters.mood} onChange={handleMoodChange}>
                    <option value="">All Moods</option>
                    <option value="Happy">Happy</option>
                    <option value="Sad">Sad</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Adventurous">Adventurous</option>
                </select>
            </div>
        </div>
    );
}

export default FilterBar;
