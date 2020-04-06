# -*- mode: python; -*-
{
    "variables": {
        "g_speak_home": "<!(./g_seek.py g_speak_home)",
        "yobuild_home": "<!(./g_seek.py yobuild_home)",
        "pkg_config_path": "<(g_speak_home)/lib/x86_64-linux-gnu/pkgconfig:<(yobuild_home)/lib/x86_64-linux-gnu/pkgconfig:<(g_speak_home)/lib/pkgconfig:<(yobuild_home)/lib/pkgconfig",
        "pkg_config": "PKG_CONFIG_PATH=<(pkg_config_path) pkg-config",
        "g_speak_pkgs": ["libPlasma"],
        "g_speak_include_dirs": ["<!@(<(pkg_config) <(g_speak_pkgs) --cflags-only-I | "
                                 "sed -e 's/-I//g')"],
        "g_speak_libs": ["<!@(<(pkg_config) <(g_speak_pkgs) --libs)"],
        "node": ["<!(command -v nodejs || command -v node)"],
    },
    "targets": [
        {
            "target_name": "gelatin",
            "sources": [
                "src/byte_serial.cc",
                "src/convert.cc",
                "src/ilkhanate.cc",
                "src/gelatin.cc",
                "src/gspeak_version.cc",
                "src/wrappers.cc",
            ],
            "include_dirs": [
                "<!(<(node) -e \"require('nan')\")",
                "<@(g_speak_include_dirs)"
            ],
            "libraries": [
                "<@(g_speak_libs)"
            ],
            "conditions": [
                ["OS=='mac'", {
                    "xcode_settings": {
                        "OTHER_CPLUSPLUSFLAGS": [
                            "-std=c++11",
                            "-stdlib=libc++",
                            "-fvisibility=hidden",
                        ],
                        "MACOSX_DEPLOYMENT_TARGET": "10.9",
                    }
                }],
                ["OS=='linux'", {
                    "cflags_cc": [
                        "-std=c++11",
                        "-fvisibility=hidden"
                    ]
                }]
            ]
        }
    ]
}
