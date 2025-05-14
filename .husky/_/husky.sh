#!/usr/bin/env sh
# husky

# Hook scripts
hook_name="$(basename -- "$0")"
GIT_PARAMS="$*"

# Husky root directory

# For parent directory
# husky_root="$(dirname -- "$0")/.."

# For current directory (when used with --hook-filename option)
husky_root="."

# Config
config_is_legacy=false
if [ -f "$husky_root/.huskyrc.js" ] || \
   [ -f "$husky_root/.huskyrc.yaml" ] || \
   [ -f "$husky_root/.huskyrc.json" ] || \
   [ -f "$husky_root/husky.config.js" ] || \
   [ -f "$husky_root/husky.config.yaml" ] || \
   [ -f "$husky_root/husky.config.json" ]; then
  config_is_legacy=true
fi

sh_is_pnpm=false
if [ "${sh_is_pnpm_set}" = true ]; then
  sh_is_pnpm=${sh_is_pnpm_value}
fi

# Set HUSKY_SKIP_HOOKS to 1 to disable all hooks.
if [ "${HUSKY_SKIP_HOOKS:-0}" = "1" ]; then
  echo "HUSKY_SKIP_HOOKS is set to 1, skipping hook"
  exit 0
fi

# Set HUSKY to 0 to disable hook when HUSKY_SKIP_HOOKS is not set.
if [ "${HUSKY:-1}" = "0" ]; then
  echo "HUSKY is set to 0, skipping hook"
  exit 0
fi

# Skip install if HUSKY_SKIP_INSTALL is true
if [ "$hook_name" = "post-merge" ] || \
   [ "$hook_name" = "post-rebase" ] || \
   [ "$hook_name" = "post-checkout" ] || \
   [ "$hook_name" = "post-rewrite" ]; then
  if [ "${HUSKY_SKIP_INSTALL:-1}" = "1" ]; then
    exit 0
  fi
fi

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Add common path where Node can be found.
# Node standard installation path
export PATH="$PATH:/usr/local/bin"
# Brew standard installation path
if command_exists brew; then
  export PATH="$(brew --prefix)/opt/node@$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)/bin:$PATH"
  export PATH="$(brew --prefix)/bin:$PATH"
fi

run_command() {
  # try to run script using package manager
  # feel free to edit this part to fit your needs

  if [ "$sh_is_pnpm" = true ] && command_exists pnpm; then
    pnpm run "$@"
    exit $?
  fi

  has_yarn_lock=false
  if [ -f yarn.lock ]; then
    has_yarn_lock=true
  fi

  has_pnpm_lock=false
  if [ -f pnpm-lock.yaml ]; then
    has_pnpm_lock=true
  fi

  has_package_lock=false
  if [ -f package-lock.json ]; then
    has_package_lock=true
  fi

  if $has_yarn_lock && ! $has_pnpm_lock && command_exists yarn; then
    yarn run --silent "$@" # --silent hides YN0000 messages
    exit $?
  fi

  if $has_pnpm_lock && command_exists pnpm; then
    pnpm run --silent "$@"
    exit $?
  fi

  npm run "$@" --silent
  exit $?
}

if $config_is_legacy; then
  echo "[Husky] $hook_name hook (legacy config)"
  echo "[Husky] This version of Husky is not compatible with legacy configuration files (.huskyrc.js, .huskyrc.yaml, .huskyrc.json, husky.config.js)."
  echo "[Husky] Please read the migration guide: https://typicode.github.io/husky/#/?id=migrate-from-legacy-configuration"
  exit 1
fi

# For non-POSIX sh, explicitly set option to exit on error
# https://typicode.github.io/husky/#/?id=option-to-exit-on-error
if [ -z "${POSIXLY_CORRECT+x}" ]; then
  set -e
fi

if [ -f "$husky_root/.husky/$hook_name" ]; then
  echo "[Husky] $hook_name hook"
  if [ "$hook_name" = "prepare-commit-msg" ]; then
    if cat "$husky_root/.husky/$hook_name" | grep -qE '(^|[^w])HUSKY_GIT_PARAMS(nw|$)'; then
      export HUSKY_GIT_PARAMS
    fi
    if cat "$husky_root/.husky/$hook_name" | grep -qE '(^|[^w])GIT_PARAMS(nw|$)'; then
      export GIT_PARAMS # deprecated
    fi
  fi
  if [ -t 1 ]; then # ensure that an interactive terminal is available
    exec < /dev/tty # ensure that the hook can read from the terminal
  fi
  sh -e "$husky_root/.husky/$hook_name" "$@"
  exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "[Husky] $hook_name hook failed (add --no-verify to bypass)"
  fi
  exit $exit_code
else
  echo "[Husky] $hook_name hook not found. This can happen if you've skipped hook installation, or if you're using a feature that has been removed in this version of Husky."
  echo "[Husky] For more information, please review the docs: https://typicode.github.io/husky"
fi 