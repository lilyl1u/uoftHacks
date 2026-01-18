import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import './DoctorPage.css';

interface HealthAnalysis {
  regularity: 'regular' | 'irregular' | 'needs_attention';
  analysis: string;
  recommendations: string[];
  statistics: {
    totalVisits: number;
    visitsPerWeek: string;
    averageTimeBetweenVisits: string;
    consistencyScore: string;
  };
}

const DoctorPage = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHealthAnalysis();
    }
  }, [user]);

  const loadHealthAnalysis = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getBowelHealthAnalysis(user.id);
      setAnalysis(data);
    } catch (err: any) {
      console.error('Failed to load health analysis:', err);
      setError(err.response?.data?.error || 'Failed to load health analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRegularityColor = (regularity: string) => {
    switch (regularity) {
      case 'regular':
        return '#2ECC71'; // Green
      case 'irregular':
        return '#F39C12'; // Orange
      case 'needs_attention':
        return '#E74C3C'; // Red
      default:
        return '#95a5a6'; // Gray
    }
  };

  const getRegularityLabel = (regularity: string) => {
    switch (regularity) {
      case 'regular':
        return 'Regular';
      case 'irregular':
        return 'Irregular';
      case 'needs_attention':
        return 'Needs Attention';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <h1>🩺 iPoo Doctor</h1>
          <div className="loading-message">Analyzing your bowel movement patterns...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <h1>🩺 iPoo Doctor</h1>
          <div className="error-message">{error}</div>
          <button onClick={loadHealthAnalysis} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <h1>🩺 pooPa  ls Doctor</h1>
          <div className="no-data-message">No analysis data available.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        <h1>🩺 iPoo Doctor</h1>
        <p className="doctor-subtitle">Your personalized bowel health analysis</p>

        {/* Regularity Status */}
        <div className="regularity-card">
          <div className="regularity-header">
            <h2>Regularity Status</h2>
            <span 
              className="regularity-badge"
              style={{ backgroundColor: getRegularityColor(analysis.regularity) }}
            >
              {getRegularityLabel(analysis.regularity)}
            </span>
          </div>
          <p className="regularity-analysis">{analysis.analysis}</p>
        </div>

        {/* Statistics */}
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-label">Total Visits</div>
            <div className="stat-value">{analysis.statistics.totalVisits}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-label">Visits per Week</div>
            <div className="stat-value">{analysis.statistics.visitsPerWeek}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-label">Avg Time Between</div>
            <div className="stat-value">{analysis.statistics.averageTimeBetweenVisits}h</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-label">Consistency</div>
            <div className="stat-value">{analysis.statistics.consistencyScore}%</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-card">
          <h2>💡 Recommendations</h2>
          <ul className="recommendations-list">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">
                <span className="recommendation-number">{index + 1}</span>
                <span className="recommendation-text">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="doctor-footer">
          <p className="disclaimer">
            ⚠️ This analysis is for informational purposes only and is not a substitute for professional medical advice. 
            If you have concerns about your digestive health, please consult with a healthcare provider.
          </p>
          <button onClick={loadHealthAnalysis} className="refresh-button">
            🔄 Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
