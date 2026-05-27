import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { ErrorIcon } from '../../assets/icons'

const PRESET_EASINGS = {
  'ease-out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
  'ease-overshoot': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-out-strong': 'cubic-bezier(0.65, 0, 0.35, 1)',
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease': 'ease',
  'linear': 'linear',
}

const DEFAULT_CONFIG = {
  // Dot transitions (default <-> inProgress <-> ready)
  dotDuration: 200,
  dotEasing: 'ease-out-strong',

  // Checkmark pop (entering ready state)
  checkDuration: 240,
  checkEasing: 'ease-overshoot',
  checkStartScale: 0.5,

  // Inner solid dot for in-progress
  innerDotDuration: 200,
  innerDotEasing: 'ease-out-strong',
  // Core scale during in-progress (vs full size on ready)
  coreInProgressScale: 0.5,

  // Which "alive" signal to use during in-progress
  aliveStyle: 'pulse-ring',

  // Pulse ring on in-progress
  pulseDuration: 2400,
  pulseHaloPx: 4,
  pulseOpacity: 0.3,

  // Breathing dot
  breatheDuration: 1600,
  breatheScale: 1.08,

  // Soft glow
  glowDuration: 1800,
  glowSpreadPx: 8,
  glowOpacity: 0.5,

  // Conic sweep
  sweepDuration: 1400,
  sweepThicknessPx: 2,

  // Progress arc
  arcDuration: 1500,
  arcThicknessPx: 2,

  // Connector line fill
  showConnector: true,
  connectorDuration: 280,
  connectorDelay: 0,
  connectorEasing: 'ease-out-strong',

  // Sequence timing for the playback
  stepStagger: 900,
  // Delay after a step becomes ready before the next step starts (lets connector finish)
  nextStepDelay: 0,
}

const STEPS = [
  { name: 'Upload files' },
  { name: 'Parse documents' },
  { name: 'Generate embeddings' },
  { name: 'Index for retrieval' },
]

function StepDot({ status, config, runId }) {
  const isInProgress = status === 'inProgress'
  const isReady = status === 'ready'
  const isError = status === 'error'

  const dotBg = {
    default: 'transparent',
    inProgress: 'color-mix(in oklch, var(--success) 30%, transparent)',
    ready: 'var(--success)',
    error: 'transparent',
  }[status] || 'transparent'

  const dotBorder = status === 'default' ? '2px solid var(--input)' : '0'

  const easeDot = PRESET_EASINGS[config.dotEasing]
  const easeCheck = PRESET_EASINGS[config.checkEasing]
  const easeInner = PRESET_EASINGS[config.innerDotEasing]

  return (
    <div
      key={runId}
      style={{
        width: 16,
        height: 16,
        borderRadius: 9999,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        background: dotBg,
        border: dotBorder,
        transition: `background-color ${config.dotDuration}ms ${easeDot}, transform ${config.dotDuration}ms ${easeDot}, opacity ${config.dotDuration}ms ${easeDot}`,
      }}
    >
      {/* Expanding/fading ring (one of two layers) */}
      {config.aliveStyle === 'pulse-ring' && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 9999,
            opacity: isInProgress ? 1 : 0,
            transition: `opacity ${config.dotDuration}ms ${easeDot}`,
            animation: isInProgress ? `lab-pulse-ring ${config.pulseDuration}ms ease-out infinite` : 'none',
          }}
        />
      )}

      {/* Soft glow */}
      {config.aliveStyle === 'soft-glow' && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 9999,
            opacity: isInProgress ? 1 : 0,
            transition: `opacity ${config.dotDuration}ms ${easeDot}`,
            animation: isInProgress ? `lab-soft-glow ${config.glowDuration}ms ease-in-out infinite` : 'none',
          }}
        />
      )}

      {/* Conic sweep */}
      {config.aliveStyle === 'conic-sweep' && (
        <span
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 9999,
            opacity: isInProgress ? 1 : 0,
            transition: `opacity ${config.dotDuration}ms ${easeDot}`,
            background: isInProgress
              ? `conic-gradient(from 0deg, transparent 0deg, transparent 280deg, color-mix(in oklch, var(--success) 70%, transparent) 360deg)`
              : 'none',
            mask: `radial-gradient(circle, transparent ${20 / 2 - config.sweepThicknessPx + 4}px, black ${20 / 2 - config.sweepThicknessPx + 4}px, black ${20 / 2 + 4}px, transparent ${20 / 2 + 4}px)`,
            WebkitMask: `radial-gradient(circle, transparent ${20 / 2 - config.sweepThicknessPx + 4}px, black ${20 / 2 - config.sweepThicknessPx + 4}px, black ${20 / 2 + 4}px, transparent ${20 / 2 + 4}px)`,
            animation: isInProgress ? `lab-conic-sweep ${config.sweepDuration}ms linear infinite` : 'none',
          }}
        />
      )}

      {/* Progress arc */}
      {config.aliveStyle === 'progress-arc' && (
        <svg
          style={{
            position: 'absolute',
            inset: -3,
            width: 26,
            height: 26,
            opacity: isInProgress ? 1 : 0,
            transition: `opacity ${config.dotDuration}ms ${easeDot}`,
            animation: isInProgress ? `lab-arc-rotate ${config.arcDuration}ms linear infinite` : 'none',
          }}
          viewBox="0 0 26 26"
        >
          <circle
            cx="13"
            cy="13"
            r="11"
            fill="none"
            stroke="var(--success)"
            strokeWidth={config.arcThicknessPx}
            strokeLinecap="round"
            strokeDasharray={`${(11 * 2 * Math.PI) * 0.75} ${(11 * 2 * Math.PI) * 0.25}`}
          />
        </svg>
      )}

      {/* Inner solid dot (visible during in-progress) */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isInProgress ? 1 : 0,
          transform: isInProgress ? 'scale(1)' : 'scale(0.9)',
          transition: `opacity ${config.innerDotDuration}ms ${easeInner}, transform ${config.innerDotDuration}ms ${easeInner}`,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: 'var(--success)',
            animation:
              isInProgress && config.aliveStyle === 'breathing-dot'
                ? `lab-breathe ${config.breatheDuration}ms ease-in-out infinite`
                : 'none',
          }}
        />
      </span>

      {/* Check icon */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-foreground)',
          opacity: isReady ? 1 : 0,
          transform: isReady ? 'scale(1)' : `scale(${config.checkStartScale})`,
          transition: `opacity ${config.checkDuration}ms ${easeCheck}, transform ${config.checkDuration}ms ${easeCheck}`,
        }}
      >
        <Check size={10} strokeWidth={3} />
      </span>

      {/* Error icon */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isError ? 1 : 0,
          transform: isError ? 'scale(1)' : 'scale(0.9)',
          transition: `opacity ${config.dotDuration}ms ${easeDot}, transform ${config.dotDuration}ms ${easeDot}`,
        }}
      >
        <ErrorIcon className="text-destructive" size={16} />
      </span>
    </div>
  )
}

function StepConnector({ status, config }) {
  const isReady = status === 'ready'
  const ease = PRESET_EASINGS[config.connectorEasing]
  return (
    <div style={{ width: 2, flex: 1, position: 'relative', overflow: 'hidden', minHeight: 16, margin: '0' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(to bottom, var(--input) 0px, var(--input) 3px, transparent 3px, transparent 7px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'top',
          background: 'var(--success)',
          borderRadius: 2,
          willChange: 'transform',
          opacity: isReady ? 1 : 0,
          transform: isReady ? 'scaleY(1)' : 'scaleY(0)',
          transition: `opacity ${config.connectorDuration}ms ${ease} ${config.connectorDelay}ms, transform ${config.connectorDuration}ms ${ease} ${config.connectorDelay}ms`,
        }}
      />
    </div>
  )
}

function StatusList({ statuses, config, runId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 4 }}>
      {STEPS.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, position: 'relative', minHeight: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0, position: 'relative' }}>
            <StepDot status={statuses[i]} config={config} runId={runId} />
            {i < STEPS.length - 1 && config.showConnector && <StepConnector status={statuses[i]} config={config} />}
            {i < STEPS.length - 1 && !config.showConnector && <div style={{ flex: 1, minHeight: 16 }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0, flex: 1, paddingBottom: i === STEPS.length - 1 ? 0 : 16 }}>
            <span
              style={{
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                lineHeight: '20px',
                color: statuses[i] === 'error' ? 'var(--destructive)' : 'var(--foreground)',
              }}
            >
              {step.name}
            </span>
            <div style={{ height: 20, display: 'flex', alignItems: 'center' }}>
              {statuses[i] === 'inProgress' && (
                <span style={{ fontSize: 14, color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>
                  Working on it…
                </span>
              )}
              {statuses[i] === 'ready' && (
                <span style={{ fontSize: 14, color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}>
                  Done
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NumberRow({ label, value, min, max, step = 1, onChange, suffix = '' }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '160px 1fr 70px', alignItems: 'center', gap: 12, fontSize: 13 }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <span style={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
        {value}
        {suffix}
      </span>
    </label>
  )
}

function ToggleRow({ label, value, onChange }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12, fontSize: 13, cursor: 'pointer' }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ justifySelf: 'start', width: 16, height: 16, cursor: 'pointer' }}
      />
    </label>
  )
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12, fontSize: 13 }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

export default function StatusLab() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [statuses, setStatuses] = useState(['default', 'default', 'default', 'default'])
  const [running, setRunning] = useState(false)
  const [runId, setRunId] = useState(0)

  const update = (key) => (val) => setConfig((c) => ({ ...c, [key]: val }))

  function reset() {
    setStatuses(['default', 'default', 'default', 'default'])
    setRunning(false)
  }

  function play() {
    reset()
    setRunId((r) => r + 1)
    setRunning(true)

    const timeouts = []
    const stagger = config.stepStagger
    // After a step becomes ready, wait for connector (its delay + duration) plus
    // the user's nextStepDelay before starting the next step's inProgress.
    const handoff = config.showConnector
      ? config.connectorDelay + config.connectorDuration + config.nextStepDelay
      : config.nextStepDelay

    // Step 0 starts inProgress at t=100 (small initial delay for visual)
    let t = 100
    STEPS.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setStatuses((prev) => {
            const next = [...prev]
            next[i] = 'inProgress'
            return next
          })
        }, t)
      )
      t += stagger
      timeouts.push(
        setTimeout(() => {
          setStatuses((prev) => {
            const next = [...prev]
            next[i] = 'ready'
            return next
          })
        }, t)
      )
      // Hold before next step starts (skip on last step)
      if (i < STEPS.length - 1) {
        t += handoff
      }
    })
    timeouts.push(setTimeout(() => setRunning(false), t + 100))

    return () => timeouts.forEach(clearTimeout)
  }

  function copyCSS() {
    const css = `/* Status animation tuning */
--ease-out-strong: ${PRESET_EASINGS[config.dotEasing]};
--ease-overshoot: ${PRESET_EASINGS[config.checkEasing]};
--ease-in-out-strong: ${PRESET_EASINGS[config.connectorEasing]};

/* StepDot transitions: ${config.dotDuration}ms ${config.dotEasing} */
/* Check pop: ${config.checkDuration}ms ${config.checkEasing}, start scale ${config.checkStartScale} */
/* Inner dot: ${config.innerDotDuration}ms ${config.innerDotEasing} */
/* Pulse ring: ${config.pulseDuration}ms loop, halo ${config.pulseHaloPx}px, opacity ${config.pulseOpacity} */
/* Connector: ${config.connectorDuration}ms ${config.connectorEasing}, delay ${config.connectorDelay}ms */
`
    navigator.clipboard?.writeText(css)
  }

  // Inject the lab pulse keyframe with current values whenever they change
  useEffect(() => {
    const id = 'lab-pulse-style'
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = `
      @keyframes lab-pulse-ring {
        0% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--success) 0%, transparent); }
        15% { box-shadow: 0 0 0 1px color-mix(in oklch, var(--success) ${Math.round(config.pulseOpacity * 100)}%, transparent); }
        60% { box-shadow: 0 0 0 ${Math.round(config.pulseHaloPx * 0.7)}px color-mix(in oklch, var(--success) ${Math.round(config.pulseOpacity * 50)}%, transparent); }
        100% { box-shadow: 0 0 0 ${config.pulseHaloPx}px color-mix(in oklch, var(--success) 0%, transparent); }
      }
      @keyframes lab-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(${config.breatheScale}); }
      }
      @keyframes lab-soft-glow {
        0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--success) 0%, transparent); }
        50% { box-shadow: 0 0 ${config.glowSpreadPx}px ${Math.max(0, config.glowSpreadPx - 4)}px color-mix(in oklch, var(--success) ${Math.round(config.glowOpacity * 100)}%, transparent); }
      }
      @keyframes lab-conic-sweep {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes lab-arc-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
  }, [config.pulseHaloPx, config.pulseOpacity, config.breatheScale, config.glowSpreadPx, config.glowOpacity])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '420px 1fr', gap: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Status Animation Lab</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 0 20px' }}>
            Tune timings, easings, and pulse. Hit Play to replay the sequence.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              onClick={play}
              disabled={running}
              style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 600, fontSize: 13, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.6 : 1 }}
            >
              {running ? 'Running…' : 'Play sequence'}
            </button>
            <button
              onClick={reset}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', fontSize: 13, cursor: 'pointer' }}
            >
              Reset
            </button>
            <button
              onClick={() => setConfig(DEFAULT_CONFIG)}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', fontSize: 13, cursor: 'pointer' }}
            >
              Defaults
            </button>
            <button
              onClick={copyCSS}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', fontSize: 13, cursor: 'pointer' }}
            >
              Copy values
            </button>
          </div>

          <Section title="Sequence">
            <NumberRow label="Step duration" value={config.stepStagger} min={200} max={2500} step={50} onChange={update('stepStagger')} suffix="ms" />
            <NumberRow label="Hold after connector" value={config.nextStepDelay} min={0} max={1000} step={20} onChange={update('nextStepDelay')} suffix="ms" />
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>
              {config.showConnector
                ? `Next step waits for the connector (${config.connectorDelay + config.connectorDuration}ms) plus this hold before starting.`
                : 'Connector is off — next step starts after just this hold.'}
            </p>
          </Section>

          <Section title="Step dot">
            <NumberRow label="Duration" value={config.dotDuration} min={60} max={600} step={10} onChange={update('dotDuration')} suffix="ms" />
            <SelectRow label="Easing" value={config.dotEasing} options={Object.keys(PRESET_EASINGS)} onChange={update('dotEasing')} />
          </Section>

          <Section title="Inner dot (in-progress)">
            <NumberRow label="In-progress scale" value={config.coreInProgressScale} min={0.2} max={1} step={0.05} onChange={update('coreInProgressScale')} />
            <NumberRow label="Duration" value={config.innerDotDuration} min={60} max={600} step={10} onChange={update('innerDotDuration')} suffix="ms" />
            <SelectRow label="Easing" value={config.innerDotEasing} options={Object.keys(PRESET_EASINGS)} onChange={update('innerDotEasing')} />
          </Section>

          <Section title="Checkmark pop">
            <NumberRow label="Duration" value={config.checkDuration} min={80} max={600} step={10} onChange={update('checkDuration')} suffix="ms" />
            <SelectRow label="Easing" value={config.checkEasing} options={Object.keys(PRESET_EASINGS)} onChange={update('checkEasing')} />
            <NumberRow label="Start scale" value={config.checkStartScale} min={0} max={1} step={0.05} onChange={update('checkStartScale')} />
          </Section>

          <Section title="Alive signal (in-progress)">
            <SelectRow
              label="Style"
              value={config.aliveStyle}
              options={['pulse-ring', 'breathing-dot', 'soft-glow', 'conic-sweep', 'progress-arc', 'none']}
              onChange={update('aliveStyle')}
            />
            {config.aliveStyle === 'pulse-ring' && (
              <>
                <NumberRow label="Duration" value={config.pulseDuration} min={800} max={4000} step={100} onChange={update('pulseDuration')} suffix="ms" />
                <NumberRow label="Halo radius" value={config.pulseHaloPx} min={2} max={12} step={1} onChange={update('pulseHaloPx')} suffix="px" />
                <NumberRow label="Halo opacity" value={config.pulseOpacity} min={0.1} max={0.6} step={0.05} onChange={update('pulseOpacity')} />
              </>
            )}
            {config.aliveStyle === 'breathing-dot' && (
              <>
                <NumberRow label="Duration" value={config.breatheDuration} min={800} max={3000} step={100} onChange={update('breatheDuration')} suffix="ms" />
                <NumberRow label="Peak scale" value={config.breatheScale} min={1.02} max={1.3} step={0.02} onChange={update('breatheScale')} />
              </>
            )}
            {config.aliveStyle === 'soft-glow' && (
              <>
                <NumberRow label="Duration" value={config.glowDuration} min={800} max={3500} step={100} onChange={update('glowDuration')} suffix="ms" />
                <NumberRow label="Spread" value={config.glowSpreadPx} min={2} max={20} step={1} onChange={update('glowSpreadPx')} suffix="px" />
                <NumberRow label="Opacity" value={config.glowOpacity} min={0.2} max={0.8} step={0.05} onChange={update('glowOpacity')} />
              </>
            )}
            {config.aliveStyle === 'conic-sweep' && (
              <>
                <NumberRow label="Duration" value={config.sweepDuration} min={600} max={3000} step={100} onChange={update('sweepDuration')} suffix="ms" />
                <NumberRow label="Thickness" value={config.sweepThicknessPx} min={1} max={4} step={1} onChange={update('sweepThicknessPx')} suffix="px" />
              </>
            )}
            {config.aliveStyle === 'progress-arc' && (
              <>
                <NumberRow label="Duration" value={config.arcDuration} min={600} max={3000} step={100} onChange={update('arcDuration')} suffix="ms" />
                <NumberRow label="Thickness" value={config.arcThicknessPx} min={1} max={4} step={1} onChange={update('arcThicknessPx')} suffix="px" />
              </>
            )}
            {config.aliveStyle === 'none' && (
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>
                No animation — just the static inner dot. Try this to feel the baseline.
              </p>
            )}
          </Section>

          <Section title="Connector line">
            <ToggleRow label="Show connector" value={config.showConnector} onChange={update('showConnector')} />
            {config.showConnector && (
              <>
                <NumberRow label="Duration" value={config.connectorDuration} min={80} max={800} step={10} onChange={update('connectorDuration')} suffix="ms" />
                <NumberRow label="Delay" value={config.connectorDelay} min={0} max={400} step={10} onChange={update('connectorDelay')} suffix="ms" />
                <SelectRow label="Easing" value={config.connectorEasing} options={Object.keys(PRESET_EASINGS)} onChange={update('connectorEasing')} />
              </>
            )}
          </Section>
        </div>

        <div>
          <div style={{ position: 'sticky', top: 32 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Preview</h2>
              <StatusList statuses={statuses} config={config} runId={runId} />
            </div>

            <div style={{ background: 'var(--muted)', borderRadius: 12, padding: 16, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--muted-foreground)', whiteSpace: 'pre-wrap' }}>
              {`dot:        ${config.dotDuration}ms · ${config.dotEasing}
inner dot:  ${config.innerDotDuration}ms · ${config.innerDotEasing}
check:      ${config.checkDuration}ms · ${config.checkEasing} · start ${config.checkStartScale}
alive:      ${config.aliveStyle}
connector:  ${config.showConnector ? `${config.connectorDuration}ms · ${config.connectorEasing} · delay ${config.connectorDelay}ms` : 'off'}
step dur:   ${config.stepStagger}ms · hold ${config.nextStepDelay}ms`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18, padding: 16, border: '1px solid var(--border)', borderRadius: 10 }}>
      <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--muted-foreground)', margin: '0 0 12px', fontWeight: 600 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}
