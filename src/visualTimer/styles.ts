export const getVisualTimerCss = (innerId: string) => `
  #left-sidebar #${innerId} {
    padding: .4em .4em .6em;
  }

  #left-sidebar #${innerId} .lse-visualTimer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: .6em;
    align-items: start;
  }

  #left-sidebar #${innerId} .lse-visualTimer-card {
    background: var(--ls-secondary-background-color);
    border: 1px solid var(--ls-border-color);
    border-radius: 6px;
    padding: .5em;
  }

  #left-sidebar #${innerId} .lse-visualTimer-title {
    font-size: .85em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--ls-secondary-text-color);
    margin-bottom: .4em;
  }

  #left-sidebar #${innerId} .lse-visualTimer-ring {
    width: 66%; /* scaled down to 2/3 */
    max-width: 92px; /* 2/3 of 140px */
    margin: 0 auto;
  }

  #left-sidebar #${innerId} .lse-visualTimer-sub {
    margin-top: .3em;
    font-size: .75em;
    color: var(--ls-secondary-text-color);
    text-align: center;
  }

  #left-sidebar #${innerId} .lse-visualTimer-settings-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--ls-link-text-color);
    cursor: pointer;
    font-size: 1em;
    padding: 0 .4em;
  }

  #left-sidebar #${innerId} .header.items-center { display: flex; align-items: center; gap: .4em }

  #left-sidebar .lse-visualTimer-ring .CircularProgressbar-text {
    transform: translateX(-2em); /* shift left */
    font-size: 0.8em; /* smaller text */
  }
`
