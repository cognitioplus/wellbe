# Well-Be – Cognitio+

The gateway to resilience, rooted in culture, powered by technology.

## Deploy
1. Fork this repo
2. Go to Settings → Pages → Source: `main` branch
3. Your site is live at: `yourname.github.io/wellbe`

## Customize
- Edit `index.html`, `css/style.css`, `js/main.js`
- Update Supabase credentials in `main.js`

## License
MIT

## Repo structure
wellbe.cognitio-plus/
└── src/
    ├── index.css       
    ├── main.tsx        
    ├── App.tsx         
    ├── components/     
    │   ├── ui/         
    │   └── hrv/       
    │       ├── HRVMeasurement.tsx
    │       ├── HRVChart.tsx
    │       └── HRVResults.tsx
    ├── hooks/          
    │   └── useHRV.ts   
    ├── lib/            
    │   ├── hrv-calculator.js
    │   └── camera-ppg.js
    └── pages/          
        ├── Index.tsx
        ├── HRVMeasurementPage.tsx
        ├── BreathingExercise.tsx
        └── ... (other pages)
