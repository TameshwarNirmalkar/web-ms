import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
// import uglify from 'rollup-plugin-uglify';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import includePaths from 'rollup-plugin-includepaths';
import json from 'rollup-plugin-json';
import browserifyPlugin from 'rollup-plugin-browserify-transform';
import brfs from 'brfs';

let includePathOptions = {
  include: {
    "./services": "lib/src/core/services",
  },
  paths: [],
  external: [],
  extensions: ['.js', '.json', '.html']
};

export default {
  input: 'dist/shared/index.js',
  output: {
    file:'dist/shared/bundles/shared.umd.js',
    format: 'umd',
    name: '@srk/shared'
  },
  external: [
    "@angular/common", "@angular/core", "@angular/http", "@angular/router", "@ngx-translate/core", "@ngx-translate/http-loader", "rxjs", "typescript-string-enums", "underscore",
  ],
  sourcemap: true,
  plugins: [
    commonjs ({
      include: [
        '../node_modules/rxjs/**',
        '../node_modules/typescript-string-enums/dist/index.js',
        '../node_modules/file-saver/FileSaver.js',
        '../node_modules/primeng/primeng.js',
        '../node_modules/devextreme-angular/ui/data-grid.js',
        '../node_modules/devextreme-angular/ui/range-selector.js',
        '../node_modules/devextreme-angular/ui/circular-gauge.js',
        '../node_modules/devextreme-angular/ui/tooltip.js',
        '../node_modules/devextreme-angular/core/template.js',
        '../node_modules/devextreme-angular/ui/tab-panel.js',
        '../node_modules/devextreme-angular/ui/tabs.js',
        '../node_modules/devextreme-angular/ui/popover.js',
        '../node_modules/ngx-owl-carousel/index.js',
        '../node_modules/primeng/components/common/api.js',
        '../node_modules/angular2-recaptcha/angular2-recaptcha.js',
        '../node_modules/underscore/underscore.js',
      ],
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        '../node_modules/primeng/primeng.js': ['SharedModule', 'InputTextModule', "InputTextareaModule", " PanelModule", " PasswordModule", " ButtonModule", " DialogModule", " DropdownModule", " RadioButtonModule", " SelectButtonModule", " DataTableModule", " MultiSelectModule", " TabViewModule", " GrowlModule", " CheckboxModule", " OverlayPanelModule", " CarouselModule", " CalendarModule", " TabMenuModule", " AccordionModule", " ConfirmDialogModule", " ConfirmationService", " InputSwitchModule", " TooltipModule", " ListboxModule", " GalleriaModule", " InplaceModule", " ProgressBarModule", " AutoCompleteModule", "EditorModule"],
      }
    }),
    nodeResolve({
      jsnext: true,
      module: true,
      browser: true
    })
    ,includePaths(includePathOptions)
  ]
}
