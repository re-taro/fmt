import type { FC } from 'react';

const Component: FC = function() {
  const click = () => {};
  return (
    <button onClick={click} onBlur={() => {}} disabled>
      <p>hi</p> |
    </button>
  );
};

export default Component;
