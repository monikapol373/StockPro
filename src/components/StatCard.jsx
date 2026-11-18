import React from 'react'

const StatCard = ({title, value, icon, change}) => {
  return (
    <div className='stat-card'>
        <div className='stat-top'>
            <div>
                <p>{title}</p>
                <h2>{value}</h2>
            </div>

            <div className='stat-icon'>{icon}</div>
        </div>

        <span className='stat-change'>{change}</span>
      
    </div>
  )
}

export default StatCard;
