'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { calcSMA, calcEMA, calcRSI, calcMACD, calcBollingerBands, formatVolume } from '@/lib/indicators';

export default function TradingChart({ candles = [], indicators = [], height = 480 }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef(new Map());
  const rsiChartRef = useRef(null);
  const macdChartRef = useRef(null);
  const [crosshairData, setCrosshairData] = useState(null);

  const hasRSI = indicators.some((i) => i.id === 'rsi');
  const hasMACD = indicators.some((i) => i.id === 'macd');
  const hasVolume = indicators.some((i) => i.id === 'volume');
  const subChartHeight = 140;

  // ── Create main chart ──
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth, height,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11 },
      grid: { vertLines: { color: 'rgba(31,41,55,0.5)' }, horzLines: { color: 'rgba(31,41,55,0.5)' } },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: 'rgba(59,130,246,0.4)', width: 1, style: 2, labelBackgroundColor: '#1f2937' }, horzLine: { color: 'rgba(59,130,246,0.4)', width: 1, style: 2, labelBackgroundColor: '#1f2937' } },
      rightPriceScale: { borderColor: 'rgba(31,41,55,0.8)', scaleMargins: { top: 0.05, bottom: hasVolume ? 0.22 : 0.05 } },
      timeScale: { borderColor: 'rgba(31,41,55,0.8)', timeVisible: true, secondsVisible: false, rightOffset: 5, barSpacing: 8 },
      handleScroll: { vertTouchDrag: false },
    });
    const cs = chart.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderUpColor: '#22c55e', borderDownColor: '#ef4444', wickUpColor: '#22c55e80', wickDownColor: '#ef444480' });
    chartRef.current = chart;
    candleSeriesRef.current = cs;
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) { setCrosshairData(null); return; }
      const d = param.seriesData.get(cs);
      if (d) setCrosshairData({ time: param.time, open: d.open, high: d.high, low: d.low, close: d.close });
    });
    const obs = new ResizeObserver((entries) => { for (const e of entries) chart.applyOptions({ width: e.contentRect.width }); });
    obs.observe(chartContainerRef.current);
    return () => { obs.disconnect(); chart.remove(); chartRef.current = null; candleSeriesRef.current = null; volumeSeriesRef.current = null; indicatorSeriesRef.current.clear(); };
  }, [height, hasVolume]);

  // ── Set candle data ──
  useEffect(() => { if (candleSeriesRef.current && candles.length) { candleSeriesRef.current.setData(candles); chartRef.current?.timeScale().fitContent(); } }, [candles]);

  // ── Overlay indicators ──
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !candles.length) return;
    indicatorSeriesRef.current.forEach((s) => { try { chart.removeSeries(s); } catch {} });
    indicatorSeriesRef.current.clear();
    if (volumeSeriesRef.current) { try { chart.removeSeries(volumeSeriesRef.current); } catch {} volumeSeriesRef.current = null; }

    if (hasVolume) {
      const vs = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, drawTicks: false });
      vs.setData(formatVolume(candles));
      volumeSeriesRef.current = vs;
    }
    for (const ind of indicators) {
      if (ind.id === 'sma') { const d = calcSMA(candles, ind.period || 20); const s = chart.addLineSeries({ color: ind.color || '#f59e0b', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); s.setData(d); indicatorSeriesRef.current.set('sma', s); }
      if (ind.id === 'ema') { const d = calcEMA(candles, ind.period || 20); const s = chart.addLineSeries({ color: ind.color || '#8b5cf6', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); s.setData(d); indicatorSeriesRef.current.set('ema', s); }
      if (ind.id === 'bb') {
        const { upper, middle, lower } = calcBollingerBands(candles, ind.period || 20, ind.stdDev || 2);
        const ms = chart.addLineSeries({ color: '#ec489980', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); ms.setData(middle);
        const us = chart.addLineSeries({ color: '#ec489950', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); us.setData(upper);
        const ls = chart.addLineSeries({ color: '#ec489950', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); ls.setData(lower);
        indicatorSeriesRef.current.set('bb-m', ms); indicatorSeriesRef.current.set('bb-u', us); indicatorSeriesRef.current.set('bb-l', ls);
      }
    }
  }, [candles, indicators, hasVolume]);

  // ── RSI sub-chart ──
  const rsiRef = useRef(null);
  useEffect(() => {
    if (rsiChartRef.current) { try { rsiChartRef.current.remove(); } catch {} rsiChartRef.current = null; }
    if (!hasRSI || !rsiRef.current || !candles.length) return;
    let disposed = false;
    const rc = createChart(rsiRef.current, { width: rsiRef.current.clientWidth, height: subChartHeight, layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10 }, grid: { vertLines: { color: 'rgba(31,41,55,0.3)' }, horzLines: { color: 'rgba(31,41,55,0.3)' } }, crosshair: { mode: CrosshairMode.Normal }, rightPriceScale: { borderColor: 'rgba(31,41,55,0.8)', scaleMargins: { top: 0.1, bottom: 0.1 } }, timeScale: { visible: false }, handleScroll: { vertTouchDrag: false } });
    const rsiCfg = indicators.find((i) => i.id === 'rsi') || {};
    const rsiData = calcRSI(candles, rsiCfg.period || 14);
    const rs = rc.addLineSeries({ color: '#06b6d4', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: true }); rs.setData(rsiData);
    if (rsiData.length) {
      const ob = rc.addLineSeries({ color: 'rgba(239,68,68,0.3)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); ob.setData(rsiData.map((d) => ({ time: d.time, value: 70 })));
      const os = rc.addLineSeries({ color: 'rgba(34,197,94,0.3)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); os.setData(rsiData.map((d) => ({ time: d.time, value: 30 })));
    }
    rsiChartRef.current = rc;
    if (chartRef.current) chartRef.current.timeScale().subscribeVisibleLogicalRangeChange((r) => { if (r && !disposed) { try { rc.timeScale().setVisibleLogicalRange(r); } catch {} } });
    const obs = new ResizeObserver((entries) => { if (!disposed) { for (const e of entries) { try { rc.applyOptions({ width: e.contentRect.width }); } catch {} } } }); obs.observe(rsiRef.current);
    return () => { disposed = true; obs.disconnect(); try { rc.remove(); } catch {} };
  }, [hasRSI, candles, indicators]);

  // ── MACD sub-chart ──
  const macdRef = useRef(null);
  useEffect(() => {
    if (macdChartRef.current) { try { macdChartRef.current.remove(); } catch {} macdChartRef.current = null; }
    if (!hasMACD || !macdRef.current || !candles.length) return;
    let disposed = false;
    const mc = createChart(macdRef.current, { width: macdRef.current.clientWidth, height: subChartHeight, layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10 }, grid: { vertLines: { color: 'rgba(31,41,55,0.3)' }, horzLines: { color: 'rgba(31,41,55,0.3)' } }, crosshair: { mode: CrosshairMode.Normal }, rightPriceScale: { borderColor: 'rgba(31,41,55,0.8)', scaleMargins: { top: 0.1, bottom: 0.1 } }, timeScale: { visible: false }, handleScroll: { vertTouchDrag: false } });
    const macdCfg = indicators.find((i) => i.id === 'macd') || {};
    const { macdLine, signalLine, histogram } = calcMACD(candles, macdCfg.fast || 12, macdCfg.slow || 26, macdCfg.signal || 9);
    mc.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false }).setData(histogram);
    const ml = mc.addLineSeries({ color: '#3b82f6', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); ml.setData(macdLine);
    const sl = mc.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }); sl.setData(signalLine);
    macdChartRef.current = mc;
    if (chartRef.current) chartRef.current.timeScale().subscribeVisibleLogicalRangeChange((r) => { if (r && !disposed) { try { mc.timeScale().setVisibleLogicalRange(r); } catch {} } });
    const obs = new ResizeObserver((entries) => { if (!disposed) { for (const e of entries) { try { mc.applyOptions({ width: e.contentRect.width }); } catch {} } } }); obs.observe(macdRef.current);
    return () => { disposed = true; obs.disconnect(); try { mc.remove(); } catch {} };
  }, [hasMACD, candles, indicators]);

  // Expose updateCandle for WebSocket
  const updateCandle = useCallback((c) => { if (candleSeriesRef.current) candleSeriesRef.current.update(c); }, []);
  useEffect(() => { if (chartContainerRef.current) chartContainerRef.current.__updateCandle = updateCandle; }, [updateCandle]);

  const fmtPrice = (v) => v?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="trading-chart-wrapper">
      <div className="chart-ohlc-bar">
        {crosshairData ? (<>
          <span className="ohlc-label">O</span><span className={crosshairData.close >= crosshairData.open ? 'ohlc-val up' : 'ohlc-val down'}>{fmtPrice(crosshairData.open)}</span>
          <span className="ohlc-label">H</span><span className={crosshairData.close >= crosshairData.open ? 'ohlc-val up' : 'ohlc-val down'}>{fmtPrice(crosshairData.high)}</span>
          <span className="ohlc-label">L</span><span className={crosshairData.close >= crosshairData.open ? 'ohlc-val up' : 'ohlc-val down'}>{fmtPrice(crosshairData.low)}</span>
          <span className="ohlc-label">C</span><span className={crosshairData.close >= crosshairData.open ? 'ohlc-val up' : 'ohlc-val down'}>{fmtPrice(crosshairData.close)}</span>
        </>) : <span className="ohlc-placeholder">Hover over chart</span>}
      </div>
      <div ref={chartContainerRef} className="chart-main" />
      {hasRSI && <div className="chart-sub-pane"><div className="chart-sub-label"><span className="sub-indicator-dot" style={{ background: '#06b6d4' }} />RSI ({indicators.find((i) => i.id === 'rsi')?.period || 14})</div><div ref={rsiRef} className="chart-sub-container" /></div>}
      {hasMACD && <div className="chart-sub-pane"><div className="chart-sub-label"><span className="sub-indicator-dot" style={{ background: '#3b82f6' }} />MACD</div><div ref={macdRef} className="chart-sub-container" /></div>}
    </div>
  );
}
