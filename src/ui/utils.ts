export function cx(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(' ');
}
