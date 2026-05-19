import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value.replace(/\D/g, ''));
      if (start === end) return;

      const totalMiliseconds = duration * 1000;
      const incrementTime = totalMiliseconds / end;

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{value.includes('+') ? '+' : ''}</span>;
};

export default function Stats() {
  const stats = [
    { label: 'Premium Properties', value: '10K+', sub: 'Verified by AI' },
    { label: 'Active Seekers', value: '5K+', sub: 'Daily synchronized' },
    { label: 'Verified Hosts', value: '1K+', sub: 'Elite network' },
    { label: 'Success Rate', value: '98%', sub: 'Match accuracy' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-1 rounded-[32px] group"
            >
              <div className="bg-secondary/40 p-8 rounded-[31px] text-center h-full hover:bg-secondary/60 transition-all duration-500 border border-white/5 group-hover:border-primary/30">
                <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">
                  <Counter value={stat.value} />
                </h3>
                <p className="text-primary font-black uppercase text-[10px] tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-text-muted text-xs font-medium">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
