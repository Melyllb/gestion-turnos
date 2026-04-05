// // import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// // // ============================================================
// // // PUBLIC LAYOUT
// // // Envoltorio para las rutas públicas: / (turnos) y /login.
// // // Proporciona el header con el logo y el botón de acceso admin,
// // // el footer, y el fondo visual consistente en toda la zona pública.
// // // El contenido de cada página se inyecta a través de <Outlet />.
// // // ============================================================

// // export const PublicLayout = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   // Saber en qué ruta estamos para ajustar el botón del header
// //   const estaEnLogin = location.pathname === '/login';

// //   return (
// //     <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

// //       {/* ── Fondo decorativo ── */}
// //       <div
// //         className="fixed inset-0 -z-10"
// //         style={{
// //           background: 'linear-gradient(135deg, #fdf6f0 0%, #fceee3 40%, #fdf0e8 70%, #faf5f0 100%)',
// //         }}
// //       >
// //         {/* Círculos decorativos desenfocados */}
// //         <div
// //           className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
// //           style={{
// //             background: 'radial-gradient(circle, #c9956a 0%, transparent 70%)',
// //             transform: 'translate(30%, -30%)',
// //             filter: 'blur(60px)',
// //           }}
// //         />
// //         <div
// //           className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
// //           style={{
// //             background: 'radial-gradient(circle, #a0725a 0%, transparent 70%)',
// //             transform: 'translate(-30%, 30%)',
// //             filter: 'blur(50px)',
// //           }}
// //         />
// //         <div
// //           className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
// //           style={{
// //             background: 'radial-gradient(circle, #d4a88a 0%, transparent 70%)',
// //             transform: 'translate(-50%, -50%)',
// //             filter: 'blur(40px)',
// //           }}
// //         />
// //       </div>

// //       {/* ── Header ── */}
// //       <header
// //         className="w-full px-6 py-5 flex items-center justify-between"
// //         style={{
// //           borderBottom: '1px solid rgba(180, 130, 100, 0.15)',
// //           backdropFilter: 'blur(8px)',
// //           backgroundColor: 'rgba(253, 246, 240, 0.85)',
// //         }}
// //       >
// //         {/* Logo */}
// //         <button
// //           onClick={() => navigate('/')}
// //           className="flex items-center gap-3 group"
// //         >
// //           <div
// //             className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform group-hover:scale-105"
// //             style={{ background: 'linear-gradient(135deg, #b87c5a, #8b5c3e)' }}
// //           >
// //             BB
// //           </div>
// //           <div className="flex flex-col leading-tight">
// //             <span
// //               className="text-lg font-bold tracking-wide"
// //               style={{ color: '#6b3f28', letterSpacing: '0.05em' }}
// //             >
// //               BeautyBrows
// //             </span>
// //             <span
// //               className="text-xs tracking-widest uppercase"
// //               style={{ color: '#b87c5a', letterSpacing: '0.15em' }}
// //             >
// //               Studio
// //             </span>
// //           </div>
// //         </button>

// //         {/* Botón admin / volver */}
// //         <button
// //           onClick={() => navigate(estaEnLogin ? '/' : '/login')}
// //           className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:shadow-md"
// //           style={{
// //             border: '1px solid rgba(180, 130, 100, 0.4)',
// //             color: '#8b5c3e',
// //             backgroundColor: 'rgba(255,255,255,0.6)',
// //             letterSpacing: '0.03em',
// //           }}
// //         >
// //           {estaEnLogin ? (
// //             <>
// //               <span>←</span>
// //               <span>Ver turnos</span>
// //             </>
// //           ) : (
// //             <>
// //               <span style={{ fontSize: '0.75rem' }}>⚙</span>
// //               <span>Acceso admin</span>
// //             </>
// //           )}
// //         </button>
// //       </header>

// //       {/* ── Contenido de la página (Outlet) ── */}
// //       <main className="flex-1 flex flex-col">
// //         <Outlet />
// //       </main>

// //       {/* ── Footer ── */}
// //       <footer
// //         className="w-full px-6 py-4 text-center text-xs"
// //         style={{
// //           borderTop: '1px solid rgba(180, 130, 100, 0.15)',
// //           color: '#b87c5a',
// //           letterSpacing: '0.08em',
// //           backgroundColor: 'rgba(253, 246, 240, 0.7)',
// //         }}
// //       >
// //         © {new Date().getFullYear()} BeautyBrows Studio · Todos los derechos reservados
// //       </footer>
// //     </div>
// //   );
// // };
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// export const PublicLayout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const estaEnLogin = location.pathname === '/login';

//   return (
//     <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

//       {/* ── Fondo degradado azul claro ── */}
//       <div
//         className="fixed inset-0 -z-10"
//         style={{
//           background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
//         }}
//       >
//         {/* Círculos decorativos */}
//         <div
//           className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
//           style={{
//             background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
//             transform: 'translate(30%, -30%)',
//             filter: 'blur(60px)',
//           }}
//         />
//         <div
//           className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
//           style={{
//             background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)',
//             transform: 'translate(-30%, 30%)',
//             filter: 'blur(50px)',
//           }}
//         />
//       </div>

//       {/* ── Header ── */}
//       <header
//         className="w-full px-6 py-5 flex items-center justify-between"
//         style={{
//           borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
//           backdropFilter: 'blur(8px)',
//           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//         }}
//       >
//         {/* Logo */}
//         <button
//           onClick={() => navigate('/')}
//           className="flex items-center gap-3 group"
//         >
//           <div
//             className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform group-hover:scale-105"
//             style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}
//           >
//             BB
//           </div>
//           <div className="flex flex-col leading-tight">
//             <span
//               className="text-lg font-bold tracking-wide"
//               style={{ color: '#1e3a8a', letterSpacing: '0.05em' }}
//             >
//               BeautyBrows
//             </span>
//             <span
//               className="text-xs tracking-widest uppercase"
//               style={{ color: '#3b82f6', letterSpacing: '0.15em' }}
//             >
//               Studio
//             </span>
//           </div>
//         </button>

//         {/* Botón admin / volver */}
//         <button
//           onClick={() => navigate(estaEnLogin ? '/' : '/login')}
//           className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:shadow-md"
//           style={{
//             border: '1px solid rgba(59, 130, 246, 0.3)',
//             color: '#2563eb',
//             backgroundColor: 'rgba(255,255,255,0.8)',
//             letterSpacing: '0.03em',
//           }}
//         >
//           {estaEnLogin ? (
//             <>
//               <span>←</span>
//               <span>Ver turnos</span>
//             </>
//           ) : (
//             <>
//               <span style={{ fontSize: '0.75rem' }}>⚙</span>
//               <span>Acceso admin</span>
//             </>
//           )}
//         </button>
//       </header>

//       {/* ── Contenido ── */}
//       <main className="flex-1 flex flex-col">
//         <Outlet />
//       </main>

//       {/* ── Footer ── */}
//       <footer
//         className="w-full px-6 py-4 text-center text-xs"
//         style={{
//           borderTop: '1px solid rgba(59, 130, 246, 0.1)',
//           color: '#64748b',
//           letterSpacing: '0.08em',
//           backgroundColor: 'rgba(255, 255, 255, 0.9)',
//         }}
//       >
//         <div className="flex justify-center gap-6 mb-2">
//           <span>PRIVACY POLICY</span>
//           <span>TERMS OF SERVICE</span>
//           <span>CONTACT US</span>
//         </div>
//         © {new Date().getFullYear()} BEAUTYBROWS STUDIO. ALL RIGHTS RESERVED.
//       </footer>
//     </div>
//   );
// };

import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const estaEnLogin = location.pathname === '/login';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Fondo ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f8fafc 100%)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header
        className="w-full px-8 flex items-center justify-between shrink-0"
        style={{
          height: '62px',
          borderBottom: '1px solid rgba(226,232,240,0.9)',
          backgroundColor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center"
        >
          <span
            className="text-lg font-bold"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            BeautyBrows
          </span>
        </button>

        {/* Nav central — solo en rutas públicas que no son login */}
        {!estaEnLogin && (
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Turnos', activo: true, ruta: '/' },
              { label: 'Servicios', activo: false },
              { label: 'Nuestro equipo', activo: false },
            ].map(({ label, activo, ruta }) => (
              <button
                key={label}
                onClick={() => ruta && navigate(ruta)}
                className="text-sm font-medium transition-colors"
                style={{
                  color: activo ? '#2563eb' : '#64748b',
                  borderBottom: activo ? '2px solid #2563eb' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Botón derecho */}
        <button
          onClick={() => navigate(estaEnLogin ? '/' : '/login')}
          className="text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: '#2563eb' }}
        >
          {estaEnLogin ? '← Ver turnos' : 'Portal Admin'}
        </button>
      </header>

      {/* ── Contenido de la página ── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full px-8 py-6 shrink-0"
        style={{
          borderTop: '1px solid rgba(226,232,240,0.9)',
          backgroundColor: 'rgba(255,255,255,0.95)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold" style={{ color: '#0f172a' }}>
            BeautyBrows
          </span>
          <div className="flex items-center gap-6">
            {['Política de privacidad', 'Términos de servicio', 'Contacto'].map((item) => (
              <span
                key={item}
                className="text-xs uppercase tracking-wider cursor-pointer transition-colors hover:text-slate-600"
                style={{ color: '#94a3b8', letterSpacing: '0.07em' }}
              >
                {item}
              </span>
            ))}
          </div>
          <span className="text-xs" style={{ color: '#94a3b8', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} BEAUTYBROWS STUDIO. TODOS LOS DERECHOS RESERVADOS.
          </span>
        </div>
      </footer>
    </div>
  );
};
