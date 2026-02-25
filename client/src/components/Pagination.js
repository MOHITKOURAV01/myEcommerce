import React from 'react';
import './Pagination.css';

function Pagination({ currentPage, totalPages, setCurrentPage }) {
    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="pagination">
            <button
                className="page-btn"
                onClick={handlePrev}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span className="page-info">
                Page {currentPage} of {totalPages}
            </span>
            <button
                className="page-btn"
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
}

export default Pagination;
