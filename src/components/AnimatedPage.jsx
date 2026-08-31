import React from 'react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 14 },
  },
};

export default function AnimatedPage({ children, className = 'space-y-4' }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;

        // Check if the child is a modal (usually has 'fixed inset-0' in className)
        const isModal =
          child.props && child.props.className && child.props.className.includes('fixed inset-0');

        if (isModal) {
          // Do not wrap modals in a staggered block, as the transform will break position: fixed
          return child;
        }

        return <motion.div variants={itemVariants}>{child}</motion.div>;
      })}
    </motion.div>
  );
}
