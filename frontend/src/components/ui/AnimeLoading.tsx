import React from 'react';

export default function AnimeLoading() {
  return (
    <div style={styles.container}>
      <div style={styles.faceContainer}>
        <div style={styles.eye}>
          <div style={styles.pupil}></div>
        </div>
        <div style={styles.eye}>
          <div style={styles.pupil}></div>
        </div>
      </div>
      <div style={styles.text}>
        Ищем твою идеальную тян... <span style={styles.dot}>.</span>
        <span style={styles.dot}>.</span>
        <span style={styles.dot}>.</span>
      </div>
      <div style={styles.subText}>
        (или хотя бы ту, которая ответит взаимностью)
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column', // ✅ typed correctly now
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#ffe6f0',
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
  },
  faceContainer: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
  },
  eye: {
    width: '80px',
    height: '80px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 4px #ff99bb, 0 0 0 8px #ffccdd',
  },
  pupil: {
    width: '40px',
    height: '40px',
    backgroundColor: '#2c3e50',
    borderRadius: '50%',
    animation: 'pupilMove 3s infinite ease-in-out',
  },
  text: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#ff6699',
    marginBottom: '0.5rem',
  },
  subText: {
    fontSize: '0.9rem',
    color: '#ff99bb',
  },
  dot: {
    animation: 'blink 1.4s infinite',
  },
};
