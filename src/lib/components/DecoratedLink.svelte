<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  let { children, ...rest }: HTMLAnchorAttributes = $props();
</script>

<a
  {...rest}
  class="focus:ring-primary focus:ring-offset-background bg-gradient-to-r from-black
to-black bg-[length:100%_1px] bg-[left_bottom]
bg-no-repeat no-underline!
hover:animate-underline
hover:from-white hover:to-white focus:ring-1 focus:ring-offset-2 focus:outline-none"
>
  {@render children?.()}
</a>

<!-- reference code below from past project -->

<!-- export default function DecoratedLink({
  href,
  target,
  children,
  onClick,
  className,
  ...props
}: {
  href: string,
  target?: string,
  children?: React.ReactNode,
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  className?: string,
}) {
  const styles = `
    bg-gradient-to-r from-secondary to-secondary group-[.vertical]:bg-gradient-to-b
    bg-[length:100%_1px] bg-[left_bottom] bg-no-repeat
    group-[.vertical]:bg-[length:1px_100%] group-[.vertical]:bg-[left_top]
    hover:from-primary hover:to-primary
    hover:animate-underline group-[.vertical]:hover:animate-underline-vertical
    focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
    ${className ? className : ''}`

  return (
    <>
      {/* next/link scroll=false will break on-page # navigation */}
      <Link href={href} target={target} className={styles} onClick={onClick} {...props}>
        {children}
      </Link>
      {target == '_blank' ?
        <span className="inline-block -rotate-45 translate-x-1 group-[.vertical]:translate-y-1"><sup>&rarr;</sup></span> : ''
      }
    </>
  )
} -->
