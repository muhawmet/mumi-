import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          background: 'var(--bg, #030407)',
          color: '#fff',
          fontFamily: "'Inter Variable', -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            padding: 32,
            borderRadius: 18,
            border: '1px solid var(--red, #f54d6b)',
            background: 'rgba(245,77,107,.06)',
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--red, #f54d6b)', fontWeight: 700 }}>
            RUNTIME HATASI
          </div>
          <h1 style={{ fontSize: 28, margin: '12px 0 18px', fontWeight: 700 }}>Bir şey ters gitti.</h1>
          <pre
            style={{
              padding: 14,
              borderRadius: 10,
              background: 'rgba(0,0,0,.4)',
              border: '1px solid rgba(255,255,255,.08)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono Variable', monospace",
              overflow: 'auto',
              maxHeight: 240,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#fdb',
            }}
          >
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={this.reset}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid var(--gold, #f7c948)',
                background: 'linear-gradient(180deg, var(--gold, #f7c948), var(--gold2, #d99a2b))',
                color: '#1a1300',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tekrar dene
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('mamilas-studio-v1');
                } catch {
                  /* ignore */
                }
                window.location.reload();
              }}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid var(--line3, #ffffff34)',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              State'i sıfırla + yeniden yükle
            </button>
          </div>
        </div>
      </div>
    );
  }
}
