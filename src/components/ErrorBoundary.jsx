import React from 'react'

class ErrorBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    render () {
        if (this.state.error) {
            return (
                <div style={{ padding: 24, background: "#fff", border: "1px solid #fecaca", borderRadius: 12 }}>
                    <h2>Something went wrong on this page.</h2>
                    <p style={{ color: "#b91c1c" }}>{String(this.state.error.message)}</p>
                    <button className='add-btn' onClick={() => this.setState({ error: null })}>
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary
