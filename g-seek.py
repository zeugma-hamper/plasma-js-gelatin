#!/usr/bin/env python

# usage: g-seek.py (g_speak_home|yobuild_home)
#
# Seeks out a g-speak home or yobuild home and prints the requested path to
# stdout.  If GELATIN_G_SPEAK_HOME is set in the environment, that value is
# used for g_speak_home requests.  yobuild_home requests are served by running
# "ob-version" from the g-speak home directory.  Used by binding.gyp.
#
# It may be helpful to run with "GSEEK_VERBOSE" set in the environment, which
# will print additional diagnostic spew.  Unfortunately, printing this spew to
# stderr (where it belongs!) unconditionally will break gyp.

from distutils.version import StrictVersion
import glob
import os
import re
import subprocess
import sys


def err_print(s):
    sys.stderr.write('{}\n'.format(s))


def debug_print(s):
    if 'GSEEK_VERBOSE' in os.environ:
        me = sys.argv[0]
        sys.stderr.write('{}: {}\n'.format(me, s))
        sys.stderr.flush()


def obvers_path(g_speak_home):
    return os.path.join(g_speak_home, 'bin', 'ob-version')


def g_speak_version_key(x):
    v = os.path.split(x)[1]
    v = v.split('g-speak')[1]
    return StrictVersion(v)


# Adapted from obi.py
def find_g_speak_home():
    """Extract the gspeak version by hook or by crook. We'll examine the
    GELATIN_G_SPEAK_HOME enviornment variable, and we'll even look at your
    files for /opt/oblong/g-speakX.YY"""
    g_speak_home = ""
    if 'GELATIN_G_SPEAK_HOME' in os.environ:
        debug_print('Using GELATIN_G_SPEAK_HOME from environment: {}'
                    .format(os.environ['GELATIN_G_SPEAK_HOME']))
        # extract the version from the enviornment variable
        g_speak_home = os.environ['GELATIN_G_SPEAK_HOME']
    else:
        debug_print('Looking up GELATIN_G_SPEAK_HOME in /opt/oblong')
        # Ignore things like g-speak-64-2
        path = os.path.join(os.path.sep, 'opt', 'oblong', 'g-speak?.*')
        try:
            items = [x for x in glob.glob(path) if os.path.isdir(x)]
            items = [x for x in items if os.path.exists(obvers_path(x))]
            g_speak_home = max(items, key=g_speak_version_key)
        except (OSError, IndexError):
            err_print('Could not find the g_speak home directory in {}'
                      .format(path))
            sys.exit(1)

    if not (os.path.exists(g_speak_home)
            and os.path.isdir(g_speak_home)
            and os.path.exists(obvers_path(g_speak_home))):
        err_print('GELATIN_G_SPEAK_HOME {0} does not exist, is not a '
                  'directory, or is missing ob-version.'.format(g_speak_home))
        sys.exit(1)
    return g_speak_home


def find_yobuild_home(g_speak_home):
    # Barring TOCTOU, find_g_speak_home should have already verified that
    # ob-version exists in the g_speak_home directory.
    version_info = subprocess.check_output(obvers_path(g_speak_home))
    pattern = re.compile(b'^\s*ob_yobuild_dir : (.*)')
    for line in version_info.splitlines():
        matchob = pattern.match(line)
        if matchob:
            return matchob.group(1).decode('utf-8')
    err_print('Could not find ob_yobuild_dir from ob-version output:\n{}'
              .format(version_info))
    sys.exit(1)


def usage():
    err_print('usage: {} (g_speak_home|yobuild_home)'
              .format(sys.argv[0]))
    sys.exit(1)


if __name__ == '__main__':
    g_speak_home = find_g_speak_home()
    yobuild_home = find_yobuild_home(g_speak_home)

    if len(sys.argv) < 2:
        usage()

    if sys.argv[1] == 'g_speak_home':
        print(g_speak_home)
    elif sys.argv[1] == 'yobuild_home':
        print(yobuild_home)
    else:
        usage()
