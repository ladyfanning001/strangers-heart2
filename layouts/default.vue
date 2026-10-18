<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      color="white"
      fixed
      app
      width="300"
    >
      <div class="sidebar-logo d-flex align-center px-4 py-4">
        <v-img src="/home.jpeg" max-width="100" contain class="mr-2"></v-img>
      </div>

      <v-divider></v-divider>

      <v-list nav dense class="pa-2">
        <template v-for="(item, i) in items">
          <v-list-group
            v-if="item.children"
            :key="'group-' + i"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-icon>
                <v-img
                  v-if="isSvgIcon(item.icon)"
                  :src="item.icon"
                  max-width="40"
                  max-height="40"
                  contain
                />
                <span v-else class="fallback-icon">{{ item.title === 'Home' ? '⌂' : '✎' }}</span>
              </v-list-item-icon>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </template>

            <v-list-item
              v-for="(child, ci) in item.children"
              :key="'child-' + ci"
              :to="child.to"
              link
              router
              exact
              class="sidebar-item sidebar-subitem"
              active-class="sidebar-item--active"
            >
              <v-list-item-icon>
                <v-img
                  v-if="isSvgIcon(child.icon)"
                  :src="child.icon"
                  max-width="40"
                  max-height="40"
                  contain
                />
                  <span v-else class="fallback-icon">•</span>
              </v-list-item-icon>
              <v-list-item-title>{{ child.title }}</v-list-item-title>
            </v-list-item>
          </v-list-group>

          <v-list-item
            v-else
            :key="'item-' + i"
            :to="item.to"
            link
            router
            exact
            class="sidebar-item"
            active-class="sidebar-item--active"
          >
            <v-list-item-icon>
              <v-img
                v-if="isSvgIcon(item.icon)"
                :src="item.icon"
                max-width="40"
                max-height="40"
                contain
              />
              <span v-else class="fallback-icon">{{ item.title === 'Home' ? '⌂' : '✎' }}</span>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <template v-slot:append>
        <v-divider></v-divider>
        <v-list nav dense class="pa-2">
          <v-list-item link class="sidebar-item" @click="handleLogout">
            <v-list-item-icon>
                <span class="fallback-icon">↪</span>
            </v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="clipped" color="white" elevation="1" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-spacer />


      <v-divider vertical class="mx-3" inset></v-divider>

    </v-app-bar>

    <v-main class="app-main">
      <v-container fluid class="pa-6">
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: true,
      miniVariant: false,
      items: [
        { icon: 'mdi-home', title: 'Home', to: '/' },
        { icon: 'mdi-pencil', title: 'Excercies', to: '/excercies' },
      ],
    }
  },
  methods: {
    isSvgIcon(icon) {
      return typeof icon === 'string' && icon.toLowerCase().endsWith('.svg')
    },
    handleLogout() {
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.app-main {
  background-color: #f5f7fa;
}

.sidebar-logo {
  background-color: #ffffff;
  justify-content: center;
}

.brand-text {
  font-size: 22px;
  font-weight: 700;
  color: #0d3b73;
}

/* ✅main and child */
.sidebar-item,
.sidebar-subitem {
  border-radius: 8px;
  margin-bottom: 10px;
  min-height: 48px;
  padding: 0 16px;
}

.sidebar-subitem {
  margin-bottom: 6px;
}

/* ✅white active */
.sidebar-item--active {
  background-color: #0d3b73 !important;
  color: #ffffff !important;
}

/* a distance between icon and text */
.sidebar-item ::v-deep .v-list-item__icon,
.sidebar-subitem ::v-deep .v-list-item__icon {
  margin-right: 16px !important;
  align-items: center;
  margin-left: 15px;
}

/* font-size */
.sidebar-item ::v-deep .v-list-item__title {
  font-size: 15px !important;
  font-weight: 500;
  margin-left: 16px !important;
}

.sidebar-subitem ::v-deep .v-list-item__title {
  font-size: 15px !important;
  font-weight: 400;
}

/* ✅ Indent ໃຫ້ເມນູລູກ (submenu) ຢູ່ຫ່າງຈາກຂອບຊ້າຍ */
::v-deep .v-list-group__items .sidebar-subitem {
  padding-left: 40px !important;
}

/* website-manage icon */
::v-deep .v-list-group__header.v-list-item {
  border-radius: 8px;
  min-height: 48px;
  padding: 0 16px;
  margin-left: 15px;
}

/* blue icon */
.sidebar-item .v-icon,
.sidebar-subitem .v-icon {
  color: #0d3b73 !important;
}

.fallback-icon {
  display: inline-flex;
  width: 24px;
  align-items: center;
  justify-content: center;
  color: #0d3b73;
  font-size: 21px;
  font-weight: 700;
}

/* icon when it is active */
.sidebar-item--active .v-icon {
  color: #ffffff !important;
}

/* drop down icon*/
::v-deep .v-list-group__header .v-icon {
  color: #0d3b73 !important;
}

::v-deep .v-list-group__header .v-list-item__title {
  font-size: 15px !important;
  font-weight: 500;
}
</style>